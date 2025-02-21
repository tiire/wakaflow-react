import { Stage, Layer } from "react-konva";
import Sticky from "react-sticky-el";
import colors from "tailwindcss/colors";
import { ChevronRight, ChevronDown } from "lucide-react";
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
import { getChartWidthByResolution } from "./utils";
import { GanttHeader } from "./GanttHeader";

export type StatelessGanttChartProps = {
  tasks: Task[];
  onCollapseTask: (taskId: string, collapsed: boolean) => void;
  collapsedTasks: string[];
  resolution: Resolution;
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
  onCollapseTask,
}: StatelessGanttChartProps) {
  const [cursorPointer, setCursorPointer] = useState(false);

  const {
    taskHeight = 40,
    stepWidth = 50,
    headerHeight = 20,
    taskStyles = {
      taskColor: colors["green"][300],
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
      return {
        ...task.task!,
        start:
          task.task!.start ??
          new Date(Math.min(...children.map((ch) => ch.start.getTime()))),
        end:
          task.task!.end ??
          new Date(Math.max(...children.map((ch) => ch.end.getTime()))),
        children,
      };
    };
    return Object.values(childrenById)
      .filter((t) => !t.task?.parentId)
      .map((t) => getFilledTask(t));
  }, [tasks]);

  const sortedTasks = useMemo(() => {
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
    return sorted;
  }, [taskTree, collapsedTasks]);

  const rowsNumber = sortedTasks.length;

  const heightChart = rowsNumber * taskHeight;

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);

  const [scrolledEle, setScrolledEle] = useState<any>(null);

  const handleScrollTable = useCallback((e: any) => {
    setScrolledEle({
      elem: "table",
      scroll: {
        scrollTop: (e.target as HTMLDivElement).scrollTop,
      },
    });
  }, []);

  const handleScrollGantt = useCallback((e: any) => {
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
  }, [scrolledEle]);
  const { chartWidth, step, from, to, minDate } = getChartWidthByResolution(
    resolution,
    taskTree,
    stepWidth
  );
  return (
    <div
      className="flex w-full bg-green-400 h-full"
      style={{ position: "relative", width: "100%" }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className={styles.scrollarea}>
          <div
            className="h-full bg-red-100 scrollarea"
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
                        className="bg-red-100 self-stretch px-4 sticky top-0"
                        style={{ height: headerHeight }}
                      >
                        {col.label}
                      </div>
                    </Sticky>
                    {sortedTasks.map((t) => (
                      <div
                        className="w-full border-b-1 border-indigo-500 flex items-center"
                        style={{ height: `${taskHeight}px` }}
                        key={t.id}
                      >
                        <div className="bg-red-100 px-4 m-auto text-center flex">
                          {ind == 0 && (
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
                          <InlineEdit
                            value={t[col.field]}
                            onSave={(value) => {
                              console.log(value);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </ResizablePanel>
                  {ind !== columns.length - 1 && <ResizableHandle />}
                </React.Fragment>
              ))}
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          className={`grow bg-blue-100 ${
            cursorPointer ? "cursor-pointer" : ""
          }`}
        >
          <div
            ref={ganttScrollRef}
            style={{ overflowY: "scroll", height: "100%" }}
            onScroll={handleScrollGantt}
          >
            <GanttHeader
              scrollToDate={minDate.getTime()}
              chartWidth={chartWidth}
              headerHeight={headerHeight}
              resolution={resolution}
              fromDate={from}
              toDate={to}
              taskHeight={taskHeight}
              stepWidth={stepWidth}
            />
            <Stage width={chartWidth} height={heightChart}>
              <Layer>
                {sortedTasks.map((t, ind) => (
                  <TaskShape
                    key={t.id}
                    ind={ind}
                    styles={taskStyles}
                    from={from}
                    step={step}
                    setCursorPointer={setCursorPointer}
                    task={t}
                    taskHeight={taskHeight}
                    stepWidth={stepWidth}
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
