/** public component */
import { Stage, Layer, Line } from "react-konva";
import Sticky from "react-sticky-el";
import colors from "tailwindcss/colors";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Stage as StageRef } from "konva/lib/Stage";
import { useGesture } from "@use-gesture/react";
import "../../../styles/global.css";
import { ResizableHandle } from "../../ui/resizable";
import { ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InlineEdit } from "../../ui/inline-edit";
import { Resolution, Task } from "./types";
import { TaskShape, TaskShapeStyles } from "./TaskShape";
import styles from "./index.module.css";
import {
  getChartWidthByResolution,
  getHeaderCells,
  getNextResolution,
  getPrevResolution,
} from "./utils";
import { GanttHeader } from "./GanttHeader";
import { DependencyShape } from "./DependencyShape";

export type StatelessGanttChartProps = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onCollapseTask: (taskId: string, collapsed: boolean) => void;
  collapsedTasks: string[];
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  columns: {
    field: string;
    label: string;
    fieldType?: "date" | "number" | "string";
    render?: (task: Task) => React.ReactNode;
  }[];
  style?: {
    taskHeight?: number;
    headerHeight?: number;
    stepWidth?: number;
    taskStyles?: TaskShapeStyles;
  };
};

type FilledTask = Task & { start: Date; end: Date; children: FilledTask[] };

export function StatelessGanttChart({
  tasks,
  resolution,
  style,
  columns,
  collapsedTasks,
  setResolution,
  onCollapseTask,
  setTasks,
}: StatelessGanttChartProps) {
  const [cursorPointer, setCursorPointer] = useState(false);

  const {
    taskHeight = 40,
    stepWidth = 50,
    headerHeight = 20,
    taskStyles = {
      taskColor: colors["green"][300],
      parentTaskColor: colors["blue"][300],
      taskResizeHandleColor: colors["green"][50],
      fontFamily: "Arial",
      cornerRadius: 5,
      transformAnchorStyle: {
        width: 8,
        cornerRadius: 8,
        offsetX: 2,
      },
    },
  } = style ?? {};

  const taskTree = useMemo(() => {
    const childrenById: Record<string, { task?: Task; children: string[] }> =
      {};

    tasks.forEach((task) => {
      const existingTask = childrenById[task.id];
      if (existingTask) {
        existingTask.task = task;
      } else {
        childrenById[task.id] = { task, children: [] };
      }
      if (task.parentId) {
        const parentTask = childrenById[task.parentId];
        if (parentTask) {
          parentTask.children.push(task.id);
        } else {
          childrenById[task.parentId] = {
            task: undefined,
            children: [task.id],
          };
        }
      }
    });
    const getFilledTask = (task: {
      task?: Task;
      children: string[];
    }): FilledTask => {
      const children = task.children.map((ch) =>
        getFilledTask(childrenById[ch])
      );
      const hasChildren = (children ?? []).length > 0;
      return {
        ...task.task!,
        start: !hasChildren
          ? task.task!.start!
          : new Date(Math.min(...children.map((ch) => ch.start.getTime()))),
        end: !hasChildren
          ? task.task!.end!
          : new Date(Math.max(...children.map((ch) => ch.end.getTime()))),
        children,
      };
    };
    return Object.values(childrenById)
      .filter((t) => !t.task?.parentId)
      .map((t) => getFilledTask(t));
  }, [tasks]);

  const { sortedTasks, dependencies } = useMemo(() => {
    const sorted: (FilledTask & { level: number; collapsed: boolean })[] = [];
    const pushTasks = (tasks: FilledTask[], level = 0) => {
      tasks.forEach((task) => {
        sorted.push({
          ...task,
          level,
          collapsed: collapsedTasks.includes(task.id),
        });
        if (collapsedTasks.includes(task.id)) {
          return;
        }
        pushTasks(
          task.children.sort((a, b) => a.start.getTime() - b.start.getTime()),
          level + 1
        );
      });
    };
    pushTasks(taskTree.sort((a, b) => a.start.getTime() - b.start.getTime()));
    const dependencies = sorted
      .map((t, ind) => {
        const deps = t.dependsOn.map((d) => {
          const depIndex = sorted.findIndex((t) => t.id === d);
          return {
            fromTask: sorted[depIndex],
            toTask: t,
            fromIndex: depIndex,
            toIndex: ind,
          };
        });
        return deps;
      })
      .flat();
    return { sortedTasks: sorted, dependencies };
  }, [taskTree, collapsedTasks]);

  const rowsNumber = sortedTasks.length;

  const heightChart = rowsNumber * taskHeight;

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [delta, setDelta] = useState(0);

  useGesture(
    {
      onPinchEnd: () => {
        if (delta < 0) {
          setResolution(getNextResolution(resolution));
        } else {
          setResolution(getPrevResolution(resolution, tasks, stepWidth));
        }
      },
      onPinch: (e) => {
        setDelta(e.delta[0]);
      },
    },
    { target: ganttScrollRef }
  );

  const [scrolledEle, setScrolledEle] = useState<{
    elem: "table" | "gantt";
    scroll: {
      scrollTop: number;
    };
  } | null>(null);

  const handleScrollTable = useCallback((e: any) => {
    if (
      scrolledEle?.elem === "table" &&
      Math.abs(
        scrolledEle.scroll.scrollTop - (e.target as HTMLDivElement).scrollTop
      ) < 10
    ) {
      return;
    }
    setScrolledEle({
      elem: "table",
      scroll: {
        scrollTop: (e.target as HTMLDivElement).scrollTop,
      },
    });
  }, []);

  const handleScrollGantt = useCallback((e: any) => {
    if (
      scrolledEle?.elem === "gantt" &&
      Math.abs(
        scrolledEle.scroll.scrollTop - (e.target as HTMLDivElement).scrollTop
      ) < 10
    ) {
      return;
    }
    setScrolledEle({
      elem: "gantt",
      scroll: {
        scrollTop: (e.target as HTMLDivElement).scrollTop,
      },
    });
  }, []);

  useEffect(() => {
    if (!scrolledEle) {
      return;
    }
    const top = scrolledEle.scroll.scrollTop;
    if (scrolledEle.elem !== "table") {
      tableScrollRef.current?.removeEventListener("scroll", handleScrollTable);
    } else {
      ganttScrollRef.current?.removeEventListener("scroll", handleScrollGantt);
    }
    const divEl =
      scrolledEle.elem !== "table"
        ? tableScrollRef.current
        : ganttScrollRef.current;
    divEl?.scrollTo({
      behavior: "instant",
      top,
    });
    if (scrolledEle.elem !== "table") {
      tableScrollRef.current?.addEventListener("scroll", handleScrollTable);
    } else {
      ganttScrollRef.current?.addEventListener("scroll", handleScrollGantt);
    }
  }, [scrolledEle?.scroll.scrollTop, scrolledEle?.elem]);

  const stageRef = useRef<StageRef>(null);

  const { chartWidth, from, to, minDate, pixelInMinResolution, step } =
    getChartWidthByResolution(resolution, taskTree, stepWidth);

  const theHeight = useMemo(
    () =>
      containerRef.current?.clientHeight
        ? containerRef.current?.clientHeight - headerHeight
        : heightChart,
    [headerHeight, heightChart]
  );

  const lines = useMemo(
    () =>
      Array.from({
        length: Math.floor(heightChart / taskHeight) + 1,
      }),
    [heightChart, taskHeight]
  );

  const { cells, parentCells } = useMemo(
    () => getHeaderCells(from, to, resolution),
    [from, to, resolution]
  );
  console.log("cells", cells);
  return (
    <div
      className="flex w-full h-full"
      style={{ position: "relative", width: "100%" }}
      ref={containerRef}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className={`${styles.scrollarea} p-0`}>
          <div
            className="h-full scrollarea"
            ref={tableScrollRef}
            onScroll={handleScrollTable}
            style={{
              zIndex: 10,
              minWidth: 400,
              overflowY: "scroll",
            }}
          >
            <ResizablePanelGroup
              direction="horizontal"
              style={{ height: heightChart + headerHeight }}
            >
              {columns.map((col, ind) => (
                <React.Fragment key={ind}>
                  <ResizablePanel
                    style={{ height: heightChart + headerHeight }}
                  >
                    <Sticky scrollElement=".scrollarea">
                      <div
                        className={`hover:bg-gray-100 dark:hover:bg-gray-800 text-left border-b-1 self-stretch sticky top-0 truncate ${styles.ganttLeftPanelHeaderCell}`}
                        style={{
                          maxHeight: `${headerHeight}px`,
                          minHeight: `${headerHeight}px`,
                          lineHeight: `${headerHeight}px`,
                        }}
                      >
                        <span className="pl-2 m-auto text-left text-sm font-bold">
                          {col.label}
                        </span>
                      </div>
                    </Sticky>
                    {sortedTasks.map((t) => (
                      <div
                        className={`border-b-1 border-gray-300 flex items-center ${styles.ganttLeftPanelCell}`}
                        style={{
                          height: `${taskHeight}px`,
                          maxHeight: `${taskHeight}px`,
                          minHeight: `${taskHeight}px`,
                          lineHeight: `${taskHeight}px`,
                        }}
                        key={t.id}
                      >
                        <div
                          className="text-right flex w-full justify-start items-center truncate"
                          style={{
                            height: `${taskHeight}px`,
                            maxHeight: `${taskHeight}px`,
                            minHeight: `${taskHeight}px`,
                            lineHeight: `${taskHeight}px`,
                          }}
                        >
                          {ind === 0 && t.children.length > 0 && (
                            <>
                              <span
                                className="inline-block4"
                                style={{ minWidth: `${t.level * 20}px` }}
                              ></span>
                              {t.collapsed ? (
                                <ChevronRight
                                  onClick={() => onCollapseTask(t.id, false)}
                                />
                              ) : (
                                <ChevronDown
                                  onClick={() => onCollapseTask(t.id, true)}
                                />
                              )}
                            </>
                          )}
                          {t.children.length === 0 && ind === 0 && (
                            <div style={{ minWidth: `${t.level * 20}px` }} />
                          )}
                          <InlineEdit
                            value={t[col.field]}
                            onSave={(value) => {
                              console.log(value);
                            }}
                            style={{ lineHeight: taskHeight }}
                          />
                        </div>
                      </div>
                    ))}
                  </ResizablePanel>
                  {ind !== columns.length - 1 && (
                    <ResizableHandle className="w-0 bg-transparent" />
                  )}
                </React.Fragment>
              ))}
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          className={`grow ${cursorPointer ? "cursor-pointer" : ""}`}
        >
          <div
            ref={ganttScrollRef}
            style={{ overflowY: "scroll", height: "100%" }}
          >
            <GanttHeader
              cells={cells}
              parentCells={parentCells}
              scrollToDate={minDate.getTime()}
              headerHeight={headerHeight}
              resolution={resolution}
              pixelInMinResolution={pixelInMinResolution}
            />
            <Stage width={chartWidth} height={theHeight} ref={stageRef}>
              <Layer>
                {lines.map((_, ind) => (
                  <Line
                    key={`${resolution}-${ind}`}
                    points={[1, ind * taskHeight, chartWidth, ind * taskHeight]}
                    stroke={colors["gray"][300]}
                    strokeWidth={1}
                  />
                ))}
                {cells
                  .reduce<{ pix: number; cellsPix: number[] }>(
                    (acc, cell) => {
                      return {
                        pix: acc.pix + cell.count,
                        cellsPix: acc.cellsPix.concat(acc.pix + cell.count),
                      };
                    },
                    { pix: 0, cellsPix: [] }
                  )
                  .cellsPix.map((pix, ind) => (
                    <Line
                      key={`${resolution}-${ind}`}
                      points={[
                        pix * pixelInMinResolution,
                        0,
                        pix * pixelInMinResolution,
                        theHeight,
                      ]}
                      stroke={colors["gray"][200]}
                      strokeWidth={1}
                    />
                  ))}
              </Layer>
              <Layer>
                {sortedTasks.map((t, ind) => (
                  <TaskShape
                    key={t.id}
                    onDatesChange={(start, end) => {
                      // if the task has children, update the children's start and end dates
                      const task = sortedTasks.find((task) => t.id === task.id);
                      const changeStartInMin = Math.floor(
                        ((task?.start.getTime() ?? 0) - start.getTime()) /
                          1000 /
                          60
                      );
                      const changeEndInMin = Math.floor(
                        ((task?.end.getTime() ?? 0) - end.getTime()) / 1000 / 60
                      );
                      if ((task?.children?.length ?? 0) > 0) {
                        if (changeStartInMin === changeEndInMin) {
                          const change =
                            start.getTime() - task!.start!.getTime();
                          const updateChildren = (
                            task: FilledTask
                          ): FilledTask[] => {
                            const kids = task.children
                              .map(updateChildren)
                              .flat();
                            return [
                              ...kids,
                              {
                                ...task,
                                start: new Date(task.start!.getTime() + change),
                                end: new Date(task.end!.getTime() + change),
                              },
                            ];
                          };
                          const updatedChildren = updateChildren(task!);
                          const updatedById = updatedChildren.reduce(
                            (acc, child) => {
                              acc[child.id] = child;
                              return acc;
                            },
                            {} as Record<string, FilledTask>
                          );
                          const newTasks = tasks.map((tt) =>
                            updatedById[tt.id] ? updatedById[tt.id] : tt
                          );
                          setTasks(newTasks);
                        } else {
                          const updatedTask = {
                            ...task!,
                            start: start,
                            end: end,
                          };
                          const updated: FilledTask[] = [updatedTask];
                          const updateChildren = (upTask: FilledTask): void => {
                            if (upTask.children.length === 0) {
                              return;
                            }
                            const first = {
                              ...upTask.children[0],
                              start: upTask.start,
                            };
                            if (upTask.children.length > 1) {
                              const last = {
                                ...upTask.children[upTask.children.length - 1],
                                end: upTask.end,
                              };
                              if (first.start.getTime() > first.end.getTime()) {
                                const temp = first.start;
                                first.start = first.end;
                                first.end = temp;
                              }
                              if (last.start.getTime() > last.end.getTime()) {
                                const temp = last.start;
                                last.start = last.end;
                                last.end = temp;
                              }
                              updated.push(first);
                              updated.push(last);
                              updateChildren(first);
                            } else {
                              const last = { ...first, end: upTask.end };
                              if (last.start.getTime() > last.end.getTime()) {
                                const temp = last.start;
                                last.start = last.end;
                                last.end = temp;
                              }
                              updated.push(last);
                              updateChildren(last);
                            }
                          };
                          updateChildren(updatedTask);
                          const updatedById = updated.reduce((acc, child) => {
                            acc[child.id] = child;
                            return acc;
                          }, {} as Record<string, FilledTask>);
                          setTasks(
                            tasks.map((tt) =>
                              updatedById[tt.id] ? updatedById[tt.id] : tt
                            )
                          );
                        }
                      } else {
                        setTasks(
                          tasks.map((tt) =>
                            t.id === tt.id ? { ...tt, start, end } : tt
                          )
                        );
                      }
                    }}
                    ind={ind}
                    styles={taskStyles}
                    from={from}
                    step={step}
                    setCursorPointer={setCursorPointer}
                    task={t}
                    taskHeight={taskHeight}
                    stepWidth={pixelInMinResolution}
                  />
                ))}
                {dependencies.map((d) => (
                  <DependencyShape
                    key={d.fromTask.id + d.toTask.id}
                    {...d}
                    from={from}
                    step={step}
                    stepWidth={pixelInMinResolution}
                    taskHeight={taskHeight}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
