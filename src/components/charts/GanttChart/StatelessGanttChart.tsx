/** public component */
import { Stage, Layer, Line, Rect } from "react-konva";
import colors from "tailwindcss/colors";
import { ChevronRight, ChevronDown, MoveDown, MoveUp } from "lucide-react";
import { Stage as StageRef } from "konva/lib/Stage";
import { useGesture } from "@use-gesture/react";
import "../../../styles/global.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { InlineEdit } from "../../ui/inline-edit";
import { FilledTask } from "./types";
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
import { useGanttContext } from "./GanttContext";
import { GanttLayout } from "./GanttLayout";
import { TaskPopup } from "./TaskPopup";

export function StatelessGanttChart({
  style,
  columns,
}: {
  style: {
    taskHeight?: number;
    stepWidth?: number;
    headerHeight?: number;
    taskStyles?: TaskShapeStyles;
  };
  columns: {
    field: string;
    label: string;
    fieldType?: "string" | "number" | "date";
  }[];
}) {
  const [cursorPointer, setCursorPointer] = useState(false);
  const {
    tasks,
    resolution,
    setResolution,
    setGanttPanelWidth,
    setContainerHeight,
    tasksTree,
    sortState,
    setSortState,
    onToggleCollapse,
    selectedTask,
    setSelectedTask,
    ganttPanelWidth,
    editing,
    highlightedTask,
    setHighlightedTask,
  } = useGanttContext();
  const {
    taskHeight = 40,
    stepWidth = 50,
    headerHeight = 20,
    taskStyles = {
      taskColor: colors["green"][300],
      taskProgressColor: colors["green"][400],
      parentTaskColor: colors["blue"][300],
      parentTaskProgressColor: colors["blue"][400],
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

  const rowsNumber = tasks.length;
  const heightChart = rowsNumber * taskHeight;
  const ganttScrollRef = useRef<HTMLDivElement>(null);

  const [delta, setDelta] = useState(0);

  useGesture(
    {
      onPinchEnd: () => {
        if (!resolution) {
          return;
        }
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
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  useEffect(() => {
    if (highlightedTask) {
      setHighlightedTask(null);
    }
  }, [scroll]);
  useEffect(() => {
    if (selectedTask) {
      setHighlightedTask(selectedTask);
    }
  }, [selectedTask]);

  return (
    <>
      <GanttLayout
        setGanttPanelWidth={setGanttPanelWidth}
        setContainerHeight={setContainerHeight}
        heightChart={heightChart}
        headerHeight={headerHeight}
        setScroll={setScroll}
        columns={columns.map((col, ind) => ({
          render: () => (
            <div
              className={`hover:bg-gray-100 w-full flex justify-left items-center dark:hover:bg-gray-800 text-left border-b-1 self-stretch sticky top-0 truncate ${styles.ganttLeftPanelHeaderCell}`}
              style={{
                maxHeight: `${headerHeight}px`,
                minHeight: `${headerHeight}px`,
                lineHeight: `${headerHeight}px`,
              }}
              onClick={() => {
                if (
                  col.field !== "start" &&
                  col.field !== "end" &&
                  !col.fieldType
                ) {
                  return;
                }
                let direction: "asc" | "desc" =
                  sortState.direction === "asc" ? "desc" : "asc";
                if (sortState.field !== col.field) {
                  direction = "desc";
                }
                setSortState({
                  direction,
                  field: col.field,
                  sortFunction: (a, b) => {
                    if (col.field === "start" || col.field === "end") {
                      return a[col.field].getTime() - b[col.field].getTime();
                    }
                    switch (col.fieldType) {
                      case "number":
                        return a[col.field] - b[col.field];
                      case "string":
                        return a[col.field].localeCompare(b[col.field]);
                      default:
                        return 0;
                    }
                  },
                });
              }}
            >
              <span className="pl-2 text-left text-sm font-bold">
                {col.label}
              </span>
              {sortState.field === col.field &&
                sortState.direction === "desc" && (
                  <MoveDown className="ml-2" size={16} />
                )}
              {sortState.field === col.field &&
                sortState.direction === "asc" && (
                  <MoveUp className="ml-2" size={16} />
                )}
            </div>
          ),
          renderContent: () => (
            <>
              {tasks.map((t) => (
                <div
                  onClick={() => {
                    setSelectedTask(t);
                  }}
                  className={`border-b-1 flex items-center ${styles.ganttLeftPanelCell}`}
                  style={{
                    height: `${taskHeight}px`,
                    maxHeight: `${taskHeight}px`,
                    minHeight: `${taskHeight}px`,
                    lineHeight: `${taskHeight}px`,
                    backgroundColor:
                      t.id === selectedTask?.id ? colors["gray"][100] : "white",
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
                            onClick={() => onToggleCollapse(t.id, false)}
                          />
                        ) : (
                          <ChevronDown
                            onClick={() => onToggleCollapse(t.id, true)}
                          />
                        )}
                      </>
                    )}
                    {t.children.length === 0 && ind === 0 && (
                      <div style={{ minWidth: `${t.level * 20}px` }} />
                    )}
                    {editing.isEnabled && editing.isBatch && (
                      <InlineEdit
                        value={t[col.field]}
                        onSave={(value) => {
                          console.log(value);
                        }}
                        style={{ lineHeight: taskHeight }}
                      />
                    )}
                    {!(editing.isEnabled && editing.isBatch) && (
                      <div
                        style={{ lineHeight: taskHeight }}
                        className="text-sm pl-2"
                      >
                        {t[col.field]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ),
        }))}
        children={
          <div
            className={`${cursorPointer ? "cursor-pointer" : ""}`}
            ref={ganttScrollRef}
            style={{
              width: ganttPanelWidth,
              maxWidth: ganttPanelWidth,
              minWidth: ganttPanelWidth,
            }}
          >
            {resolution && (
              <GanttContent
                taskTree={tasksTree}
                scroll={scroll}
                stepWidth={stepWidth}
                headerHeight={headerHeight}
                heightChart={heightChart}
                taskHeight={taskHeight}
                taskStyles={taskStyles}
                setCursorPointer={setCursorPointer}
              />
            )}
          </div>
        }
      />
    </>
  );
}

function GanttContent({
  taskTree,
  stepWidth,
  headerHeight,
  heightChart,
  taskHeight,
  taskStyles,
  setCursorPointer,
}: {
  taskTree: FilledTask[];
  stepWidth: number;
  headerHeight: number;
  heightChart: number;
  taskHeight: number;
  scroll: { left: number; top: number };
  taskStyles: TaskShapeStyles;
  setCursorPointer: (cursorPointer: boolean) => void;
}) {
  const {
    tasks,
    resolution,
    dependencies,
    onDatesChange,
    onProgressChange,
    selectedTask,
    selectedDependency,
    setSelectedTask,
    setSelectedDependency,
    onAddDependency,
    editing,
    onDeleteDependency,
    setHighlightedTask,
  } = useGanttContext();
  const { chartWidth, from, to, minDate, pixelInMinResolution, step } =
    getChartWidthByResolution(resolution!, taskTree, stepWidth);
  const stageRef = useRef<StageRef>(null);
  const [depDragState, setDepDragState] = useState({
    x: 0,
    y: 0,
    ind: 0,
  });
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const lines = useMemo(
    () =>
      Array.from({
        length: Math.floor(heightChart / taskHeight) + 1,
      }),
    [heightChart, taskHeight]
  );

  const { cells, parentCells } = useMemo(
    () => getHeaderCells(from, to, resolution!),
    [from, to, resolution]
  );

  const theHeight = heightChart + headerHeight;
  const highlightedDragging = tasks.filter((t, index) => {
    const depsTo = dependencies.filter((d) => d.toTask.id === t.id);
    if (depsTo.find((d) => d.fromIndex === depDragState.ind)) {
      return false;
    }
    const start =
      Math.floor((t.start.getTime() - from.getTime()) / step) *
      pixelInMinResolution;
    const isHighLighDragging =
      index !== depDragState.ind &&
      (depDragState.x !== 0 || depDragState.y !== 0) &&
      Math.abs(depDragState.x - start - 6) < 50 &&
      Math.abs(
        depDragState.y - index * taskHeight - Math.floor(taskHeight / 2)
      ) < 50;
    return isHighLighDragging;
  });
  if (tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <div className="text-gray-500">No data</div>
      </div>
    );
  }

  return (
    <div style={{ width: chartWidth }}>
      <GanttHeader
        cells={cells}
        parentCells={parentCells}
        scrollToDate={minDate.getTime()}
        headerHeight={headerHeight}
        resolution={resolution!}
        pixelInMinResolution={pixelInMinResolution}
      />
      <Stage
        onMouseMove={() => {
          setMousePos(stageRef.current?.getPointerPosition() ?? { x: 0, y: 0 });
        }}
        width={chartWidth}
        height={heightChart}
        ref={stageRef}
        onClick={(e) => {
          const ind = Math.floor(e.evt.offsetY / taskHeight);
          const seleted = tasks[ind];
          if (!seleted) {
            setSelectedTask(null);
            setHighlightedTask(null);
          } else {
            setSelectedTask(tasks[ind]);
            setHighlightedTask(tasks[ind]);
          }
        }}
      >
        <Layer>
          {lines.map((_, ind) => (
            <Line
              key={`${resolution}-${ind}`}
              points={[1, ind * taskHeight, chartWidth, ind * taskHeight]}
              stroke={colors["gray"][300]}
              strokeWidth={1}
            />
          ))}
          {selectedTask && (
            <Rect
              x={0}
              y={tasks.findIndex((t) => t.id === selectedTask?.id) * taskHeight}
              width={chartWidth}
              height={taskHeight}
              fill={colors["gray"][100]}
            />
          )}
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
          {dependencies.map((d) => (
            <DependencyShape
              isEditingEnabled={editing.isEnabled}
              onDeleteDependency={async () => {
                onDeleteDependency({
                  from: d.fromTask.id,
                  to: d.toTask.id,
                });
              }}
              selectedDependency={selectedDependency}
              setSelectedDependency={setSelectedDependency}
              key={d.fromTask.id + d.toTask.id}
              {...d}
              from={from}
              step={step}
              stepWidth={pixelInMinResolution}
              taskHeight={taskHeight}
              setCursorPointer={setCursorPointer}
            />
          ))}
          {tasks.map((t, ind) => (
            <TaskShape
              mousePos={mousePos}
              isHighLighDragging={
                !!highlightedDragging.find((tt) => tt.id === t.id)
              }
              onDependencyDrag={(x, y, isEnd) => {
                setDepDragState({
                  x,
                  y,
                  ind,
                });
                if (isEnd) {
                  try {
                    const targetTaskInd = Math.floor(y / taskHeight);
                    const currentTask = tasks[targetTaskInd];
                    if (!currentTask) {
                      return;
                    }
                    if (
                      !highlightedDragging.find(
                        (tt) => tt.id === currentTask.id
                      )
                    ) {
                      return;
                    }
                    const startX =
                      Math.floor(
                        (currentTask.start.getTime() - from.getTime()) / step
                      ) *
                        pixelInMinResolution -
                      6;
                    const startY =
                      targetTaskInd * taskHeight + Math.floor(taskHeight / 2);
                    if (
                      Math.abs(x - startX) < 10 &&
                      Math.abs(y - startY) < 10
                    ) {
                      onAddDependency({
                        from: t.id,
                        to: currentTask.id,
                      });
                    }
                  } finally {
                    setDepDragState({
                      x: 0,
                      y: 0,
                      ind: 0,
                    });
                  }
                }
              }}
              key={t.id}
              setCursorPointer={setCursorPointer}
              ind={ind}
              styles={taskStyles}
              from={from}
              step={step}
              task={t}
              taskHeight={taskHeight}
              stepWidth={pixelInMinResolution}
            />
          ))}
        </Layer>
        <Layer>
          <TaskPopup
            mousePos={mousePos}
            from={from}
            taskHeight={taskHeight}
            step={step}
            stepWidth={pixelInMinResolution}
          />
        </Layer>
        <Layer name="top-layer" />
      </Stage>
    </div>
  );
}
