import { useEffect } from "react";
import colors from "tailwindcss/colors";
import { useRef, useState } from "react";
import { Portal } from "react-konva-utils";
import { Circle as KonvaCircle } from "konva/lib/shapes/Circle";
import {
  Circle,
  Group,
  Line,
  Rect,
  RegularPolygon,
  Text,
  Transformer,
} from "react-konva";
import { FilledTask, Task } from "./types";
import { useGanttContext } from "./GanttContext";

export type TaskShapeStyles = {
  taskColor: string | ((task: Task) => string);
  taskProgressColor: string | ((task: Task) => string);
  parentTaskColor: string | ((task: Task) => string); // Added parentTaskColor
  parentTaskProgressColor: string | ((task: Task) => string);
  fontFamily: string;
  cornerRadius: number;
  taskResizeHandleColor: string | ((task: Task) => string);
  transformAnchorStyle: {
    width: number;
    cornerRadius: number;
    offsetX: number;
  };
};

export function TaskShape({
  task: t,
  taskHeight,
  stepWidth,
  ind,
  from,
  step,
  setCursorPointer,
  styles,
  isHighLighDragging,
  onDependencyDrag,
}: {
  task: FilledTask;
  taskHeight: number;
  stepWidth: number;
  ind: number;
  from: Date;
  step: number;
  mousePos: { x: number; y: number };
  setCursorPointer: (cursorPointer: boolean) => void;
  styles: TaskShapeStyles;
  isHighLighDragging: boolean;
  onDependencyDrag: (x: number, y: number, isEnd: boolean) => void;
}) {
  const {
    highlightedTask,
    setHighlightedTask,
    setSelectedTask,
    onProgressChange,
    showTaskPopup,
    setShowTaskPopup,
  } = useGanttContext();

  const { taskColor, fontFamily } = styles;
  const color = typeof taskColor === "function" ? taskColor(t) : taskColor;

  const [isTooltipEnabled, setIsTooltipEnabled] = useState(true);
  const procentRectRef = useRef<any | undefined>(undefined);
  const procentTrRef = useRef<any | undefined>(undefined);

  useEffect(() => {
    if (procentTrRef.current) {
      procentTrRef.current.nodes([procentRectRef.current]);
      procentTrRef.current.getLayer().batchDraw();
    }
  }, [procentTrRef.current, procentRectRef.current, highlightedTask]);

  const isMilestone = t.start.getTime() === t.end.getTime();

  const start =
    Math.floor((t.start.getTime() - from.getTime()) / step) * stepWidth;
  const end = isMilestone
    ? start + 15
    : Math.ceil((t.end.getTime() - from.getTime()) / step) * stepWidth;

  const {
    onDatesChange: onTaskDatesChange,
    taskModificationState: modificationState,
    setTaskModificationState,
  } = useGanttContext();

  const onDatesChange = (start: Date, end: Date) => {
    onTaskDatesChange(t, start, end);
  };
  const taskState = highlightedTask?.id === t.id ? modificationState ?? t : t;

  const hoverHandler = {
    onMouseEnter: () => {
      setHighlightedTask(t);
      setCursorPointer(true);
    },
    onMouseLeave: () => {
      setHighlightedTask(null);
      setCursorPointer(false);
    },
    onClick: () => {
      console.log("CLICKED TASK", t);
      setSelectedTask(t);
      setHighlightedTask(t);
      setShowTaskPopup(true);
    },
    onClosePopup: () => setShowTaskPopup(false),
    showPopup: showTaskPopup,
    onTap: () => {
      setSelectedTask(t);
      setHighlightedTask(t);
      setShowTaskPopup(true);
    },
  };

  return (
    <>
      <Assignees
        t={t}
        end={end}
        ind={ind}
        taskHeight={taskHeight}
        fontFamily={fontFamily}
      />
      {isMilestone && (
        <ShowMilestone
          color={color}
          start={start}
          ind={ind}
          taskHeight={taskHeight}
          hoverHandler={hoverHandler}
        />
      )}
      {!isMilestone && (
        <ShowTask
          styles={styles}
          ind={ind}
          taskHeight={taskHeight}
          t={t}
          procentState={taskState.progress}
          procentRectRef={procentRectRef}
          start={start}
          end={end}
          hoverHandler={hoverHandler}
        />
      )}
      {isMilestone && (
        <DraggableMilestone
          t={t}
          isSelected={highlightedTask?.id === t.id}
          start={start}
          ind={ind}
          taskHeight={taskHeight}
          from={from}
          step={step}
          stepWidth={stepWidth}
          onDatesChange={onDatesChange}
          hoverHandler={hoverHandler}
          styles={styles}
          datesState={taskState}
          setDatesState={({ start, end }) =>
            setTaskModificationState({
              start,
              end,
              progress: taskState.progress,
            })
          }
        />
      )}
      {!isMilestone && (
        <ResizableTask
          t={t}
          isSelected={highlightedTask?.id === t.id}
          start={start}
          end={end}
          datesState={taskState}
          setDatesState={({ start, end }) =>
            setTaskModificationState({
              start,
              end,
              progress: taskState.progress,
            })
          }
          hoverHandler={hoverHandler}
          ind={ind}
          taskHeight={taskHeight}
          from={from}
          step={step}
          stepWidth={stepWidth}
          onDatesChange={onDatesChange}
          setCursorPointer={setCursorPointer}
          setIsSelected={(isSelected) =>
            setHighlightedTask(isSelected ? t : null)
          }
          styles={styles}
          setTaskSelected={() => setSelectedTask(t)}
        />
      )}
      {highlightedTask?.id === t.id && !isMilestone && (
        <Transformer
          rotateEnabled={false}
          onTransformEnd={() => {
            onProgressChange(t, taskState.progress);
            procentRectRef.current.scaleX(1);
            procentRectRef.current.x(0);
          }}
          onTransform={(e) => {
            const currentProcent = Math.floor(
              ((e.target.width() * e.target.scaleX()) / (end - start)) * 100
            );
            if (currentProcent > 100) {
              setTaskModificationState({ ...taskState, progress: 100 });
              e.target.scaleX(Math.floor((end - start) / e.target.width()));
            } else {
              setTaskModificationState({
                ...taskState,
                progress: currentProcent,
              });
            }
            if (e.target.x() < 0) {
              e.target.scaleX(0.001);
              e.target.x(0.001);
              setTaskModificationState({
                ...taskState,
                progress: 0,
              });
            }
          }}
          rotateLineVisible={false}
          flipEnabled={false}
          enabledAnchors={highlightedTask?.id === t.id ? ["middle-right"] : []}
          ref={procentTrRef}
          {...hoverHandler}
        />
      )}
      <DependencyDrag
        isHighLighDragging={isHighLighDragging}
        start={start}
        end={end}
        ind={ind}
        taskHeight={taskHeight}
        color={color}
        onDependencyDrag={onDependencyDrag}
        isSelected={highlightedTask?.id === t.id}
        setIsTooltipEnabled={setIsTooltipEnabled}
        hoverHandler={hoverHandler}
      />
    </>
  );
}

function ShowMilestone({
  color,
  start,
  ind,
  taskHeight,
  hoverHandler,
}: {
  color: string;
  start: number;
  ind: number;
  hoverHandler: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onClosePopup: () => void;
    showPopup: boolean;
    onTap: () => void;
  };
  taskHeight: number;
}) {
  return (
    <>
      <Group x={start + 10} y={ind * taskHeight} {...hoverHandler}>
        <RegularPolygon
          x={0}
          y={taskHeight / 2}
          sides={4}
          radius={10}
          fill={color}
        />
      </Group>
    </>
  );
}

function ResizableTask({
  t,
  isSelected,
  start,
  end,
  ind,
  taskHeight,
  styles,
  from,
  step,
  stepWidth,
  onDatesChange,
  datesState,
  setDatesState,
  hoverHandler,
}: {
  t: Task;
  isSelected: boolean;
  styles: TaskShapeStyles;
  start: number;
  hoverHandler: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onClosePopup: () => void;
    showPopup: boolean;
    onTap: () => void;
  };
  end: number;
  ind: number;
  taskHeight: number;
  from: Date;
  step: number;
  stepWidth: number;
  onDatesChange: (start: Date, end: Date) => void;
  setCursorPointer: (cursorPointer: boolean) => void;
  setIsSelected: (isSelected: boolean) => void;
  datesState: { start: Date; end: Date };
  setDatesState: (datesState: { start: Date; end: Date }) => void;
  setTaskSelected: (taskSelected: boolean) => void;
}) {
  const {
    taskResizeHandleColor,
    cornerRadius,
    parentTaskColor,
    taskColor,
    transformAnchorStyle,
  } = styles;
  const resizeHandleColor =
    typeof taskResizeHandleColor === "function"
      ? taskResizeHandleColor(t)
      : taskResizeHandleColor;
  const resizeRectRef = useRef<any | undefined>(undefined);
  const shapeRef = useRef<any | undefined>(undefined);
  const trRef = useRef<any | undefined>(undefined);
  useEffect(() => {
    if (trRef.current) {
      trRef.current.nodes([resizeRectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, trRef.current, resizeRectRef.current]);

  const color = typeof taskColor === "function" ? taskColor(t) : taskColor;

  return (
    <>
      <Group
        x={start}
        y={ind * taskHeight + 6}
        draggable
        {...hoverHandler}
        ref={shapeRef}
        onDragMove={(e) => {
          e.target.y(ind * taskHeight + 6);
          e.target.x(Math.floor(e.target.x() / stepWidth) * stepWidth);
          const newStart = new Date(
            from.getTime() + Math.floor((e.target.x() * step) / stepWidth)
          );
          const width = t.end!.getTime() - t.start!.getTime();
          const newEnd = new Date(newStart.getTime() + width);
          setDatesState({ start: newStart, end: newEnd });
        }}
        onDragEnd={() => {
          onDatesChange(datesState.start, datesState.end);
        }}
      >
        <Rect
          x={0}
          y={0}
          width={end - start + 20}
          height={taskHeight - 12}
          fill="transparent"
          strokeWidth={0}
          scaleX={1}
        />
        <Rect
          x={0}
          y={0}
          ref={resizeRectRef}
          width={end - start}
          height={taskHeight - 12}
          fill="transparent"
          cornerRadius={cornerRadius}
          stroke={
            t.children.length > 0
              ? typeof parentTaskColor === "function"
                ? parentTaskColor(t)
                : parentTaskColor
              : color
          } // Modified stroke
          strokeWidth={2}
          scaleX={1}
        />
      </Group>
      {isSelected && (
        <Transformer
          {...hoverHandler}
          enabledAnchors={isSelected ? ["middle-left", "middle-right"] : []}
          rotateEnabled={false}
          onTransform={(e) => {
            const newStart = new Date(
              Math.floor(
                (from.getTime() +
                  ((start + resizeRectRef.current.x()) * step) / stepWidth) /
                  step
              ) * step
            );
            const width = Math.ceil(
              (resizeRectRef.current.width() * e.target.scaleX() * step) /
                stepWidth
            );
            const newEnd = new Date(
              Math.floor((newStart.getTime() + width) / step) * step
            );
            setDatesState({ start: newStart, end: newEnd });
            if (e.target.width() * e.target.scaleX() < stepWidth) {
              e.target.scaleX(Math.ceil(stepWidth / e.target.width()));
              e.target.x(0);
            }
          }}
          rotateLineVisible={false}
          borderEnabled={isSelected ? true : false}
          flipEnabled={false}
          onTransformEnd={() => {
            onDatesChange(datesState.start, datesState.end);
            resizeRectRef.current.scaleX(1);
            resizeRectRef.current.x(0);
          }}
          anchorStyleFunc={(anchor) => {
            anchor.height(taskHeight - 16);
            anchor.offsetY(taskHeight / 2 - 8);
            anchor.width(transformAnchorStyle?.width ?? 8);
            anchor.fill(resizeHandleColor);
            if (anchor.hasName("middle-left")) {
              anchor.offsetX(-(transformAnchorStyle?.offsetX ?? 5));
            } else {
              anchor.offsetX(
                (transformAnchorStyle?.offsetX ?? 5) +
                  (transformAnchorStyle?.width ?? 8)
              );
            }
          }}
          anchorStroke={resizeHandleColor}
          anchorStrokeWidth={1}
          anchorCornerRadius={transformAnchorStyle?.cornerRadius ?? 8}
          ref={trRef}
        />
      )}
    </>
  );
}

function DraggableMilestone({
  t,
  isSelected,
  start,
  ind,
  taskHeight,
  styles,
  from,
  step,
  stepWidth,
  onDatesChange,
  datesState,
  setDatesState,
  hoverHandler,
}: {
  t: Task;
  isSelected: boolean;
  styles: TaskShapeStyles;
  start: number;
  ind: number;
  taskHeight: number;
  from: Date;
  step: number;
  hoverHandler: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onClosePopup: () => void;
    showPopup: boolean;
    onTap: () => void;
  };
  stepWidth: number;
  onDatesChange: (start: Date, end: Date) => void;
  datesState: { start: Date; end: Date };
  setDatesState: (datesState: { start: Date; end: Date }) => void;
}) {
  const { taskColor } = styles;
  const resizeRectRef = useRef<any | undefined>(undefined);
  const shapeRef = useRef<any | undefined>(undefined);
  const trRef = useRef<any | undefined>(undefined);
  useEffect(() => {
    if (trRef.current) {
      trRef.current.nodes([resizeRectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, trRef.current, resizeRectRef.current]);

  const color = typeof taskColor === "function" ? taskColor(t) : taskColor;

  return (
    <>
      <Group
        x={start + 10}
        y={ind * taskHeight}
        draggable
        ref={shapeRef}
        {...hoverHandler}
        onDragMove={(e) => {
          e.target.y(ind * taskHeight);
          e.target.x(Math.floor(e.target.x() / stepWidth) * stepWidth);
          const newStart = new Date(
            from.getTime() + Math.floor((e.target.x() * step) / stepWidth)
          );
          setDatesState({ start: newStart, end: newStart });
        }}
        onDragEnd={() => {
          onDatesChange(datesState.start, datesState.end);
        }}
      >
        <RegularPolygon
          x={0}
          y={taskHeight / 2}
          sides={4}
          radius={10}
          fill="transparent"
          stroke={color}
          strokeWidth={2}
        />
      </Group>
    </>
  );
}

function ShowTask({
  styles,
  ind,
  taskHeight,
  hoverHandler,
  t,
  procentState,
  procentRectRef,
  start,
  end,
}: {
  styles: TaskShapeStyles;
  hoverHandler: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onClosePopup: () => void;
    showPopup: boolean;
  };
  ind: number;
  procentRectRef: any;
  t: Task;
  procentState: number;
  start: number;
  end: number;
  taskHeight: number;
}) {
  const textRef = useRef<any | undefined>(undefined);
  const rectRef = useRef<any | undefined>(undefined);
  const {
    taskColor,
    parentTaskColor, // Added parentTaskColor
    fontFamily,
    cornerRadius,
  } = styles;
  let procentColor =
    typeof styles.taskProgressColor === "function"
      ? styles.taskProgressColor(t)
      : styles.taskProgressColor;
  if (t.children.length > 0) {
    procentColor =
      typeof styles.parentTaskProgressColor === "function"
        ? styles.parentTaskProgressColor(t)
        : styles.parentTaskProgressColor;
  }
  const color = typeof taskColor === "function" ? taskColor(t) : taskColor;

  return (
    <>
      <Group
        x={start}
        y={ind * taskHeight + 6}
        clip={{
          x: -2,
          y: 0,
          width: end - start + 5,
          height: taskHeight,
        }}
        {...hoverHandler}
      >
        <Rect
          x={0}
          y={0}
          ref={rectRef}
          width={end - start}
          height={taskHeight - 12}
          fill={
            t.children.length > 0
              ? typeof parentTaskColor === "function"
                ? parentTaskColor(t)
                : parentTaskColor
              : color
          }
          cornerRadius={cornerRadius}
        />
        {t.children.length > 0 && (
          <>
            <RegularPolygon
              x={3}
              y={taskHeight - 13}
              fill={
                t.children.length > 0
                  ? typeof parentTaskColor === "function"
                    ? parentTaskColor(t)
                    : parentTaskColor
                  : color
              }
              rotation={90}
              sides={3}
              radius={8}
            />
            <RegularPolygon
              x={end - start - 3}
              y={taskHeight - 13}
              fill={
                t.children.length > 0
                  ? typeof parentTaskColor === "function"
                    ? parentTaskColor(t)
                    : parentTaskColor
                  : color
              }
              rotation={-90}
              sides={3}
              radius={8}
            />
          </>
        )}
        <Rect
          x={0}
          y={0}
          ref={procentRectRef}
          cornerRadius={cornerRadius}
          width={Math.floor(((end - start) * procentState) / 100) || 1}
          height={taskHeight - 12}
          fill={procentColor}
          {...hoverHandler}
        />
        <Text
          x={18}
          y={Math.floor(taskHeight / 2) - 12}
          text={t.name}
          ref={textRef}
          fontSize={12}
          fontFamily={fontFamily}
        />
      </Group>
    </>
  );
}
function DependencyDrag({
  isHighLighDragging,
  start,
  end,
  ind,
  taskHeight,
  color,
  onDependencyDrag,
  isSelected,
  setIsTooltipEnabled,
  hoverHandler,
}: {
  isHighLighDragging: boolean;
  start: number;
  end: number;
  ind: number;
  taskHeight: number;
  color: string;
  setIsTooltipEnabled: (isTooltipEnabled: boolean) => void;
  hoverHandler: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onClosePopup: () => void;
    showPopup: boolean;
    onTap: () => void;
  };
  onDependencyDrag: (
    x: number,
    y: number,
    isEnd: boolean,
    currentTaskInd: number
  ) => void;
  isSelected: boolean;
}) {
  const [depDragState, setDepDragState] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const depDragRef = useRef<KonvaCircle | null>(null);

  return (
    <>
      {isHighLighDragging && (
        <Circle
          x={start - 6}
          y={ind * taskHeight + Math.floor(taskHeight / 2)}
          radius={6}
          fill={color}
        />
      )}
      <Portal
        selector=".top-layer"
        enabled={depDragState.x !== 0 || depDragState.y !== 0}
      >
        <Line
          points={[
            end + 2,
            ind * taskHeight + Math.floor(taskHeight / 2),
            depDragState.x || end + 2,
            depDragState.y || ind * taskHeight + Math.floor(taskHeight / 2),
          ]}
          stroke={colors.gray[500]}
          strokeWidth={2}
        />
        <Circle
          x={end + 6}
          y={ind * taskHeight + Math.floor(taskHeight / 2)}
          radius={6}
          onDragMove={(e) => {
            setIsTooltipEnabled(false);
            onDependencyDrag(e.target.x(), e.target.y(), false, ind);
            setDepDragState({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          {...hoverHandler}
          onDragEnd={(e) => {
            onDependencyDrag(e.target.x(), e.target.y(), true, ind);
            setIsTooltipEnabled(true);
            setDepDragState({
              x: 0,
              y: 0,
            });
            e.target.x(end + 6);
            e.target.y(ind * taskHeight + Math.floor(taskHeight / 2));
          }}
          ref={depDragRef}
          fill={isSelected ? color : "transparent"}
          stroke={isSelected ? colors.gray[500] : "transparent"}
          strokeWidth={1}
          draggable
        />
      </Portal>
    </>
  );
}

function Assignees({
  t,
  end,
  ind,
  taskHeight,
  fontFamily,
}: {
  t: Task;
  end: number;
  ind: number;
  taskHeight: number;
  fontFamily: string;
}) {
  const assigneeRectRef = useRef<any | undefined>(undefined);
  const assigneeRef = useRef<any | undefined>(undefined);
  useEffect(() => {
    assigneeRectRef.current?.width(assigneeRef.current?.width());
  }, [assigneeRef.current]);

  if (t.assignees.length === 0) {
    return null;
  }
  return (
    <>
      <Rect
        x={end + 14}
        ref={assigneeRectRef}
        cornerRadius={4}
        y={ind * taskHeight + 8}
        width={assigneeRef.current?.width()}
        height={taskHeight - 16}
        stroke={colors.gray[500]}
        fill={colors.gray[500]}
        strokeWidth={2}
      />
      <Text
        ref={assigneeRef}
        x={end + 14}
        y={ind * taskHeight + Math.floor(taskHeight / 2) - 4}
        text={
          "  " + t.assignees.map((assignee) => assignee.name).join(", ") + "  "
        }
        fontStyle="bold"
        fontSize={12}
        fill={colors.white}
        fontFamily={fontFamily}
      />
    </>
  );
}
