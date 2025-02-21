import { useEffect } from "react";
import { useRef, useState } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import { Task } from "./types";

export type TaskShapeStyles = {
  taskColor: string | ((task: Task) => string);
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
}: {
  task: Task & { start: Date; end: Date };
  taskHeight: number;
  stepWidth: number;
  ind: number;
  from: Date;
  step: number;
  setCursorPointer: (cursorPointer: boolean) => void;
  styles: TaskShapeStyles;
}) {
  const shapeRef = useRef<any | undefined>(undefined);
  const trRef = useRef<any | undefined>(undefined);
  const textRef = useRef<any | undefined>(undefined);
  const {
    taskColor,
    fontFamily,
    cornerRadius,
    taskResizeHandleColor,
    transformAnchorStyle,
  } = styles;
  const color = typeof taskColor === "function" ? taskColor(t) : taskColor;
  const [isSelected, setIsSelected] = useState(false);
  const resizeHandleColor =
    typeof taskResizeHandleColor === "function"
      ? taskResizeHandleColor(t)
      : taskResizeHandleColor;
  useEffect(() => {
    trRef.current.nodes([shapeRef.current]);
    trRef.current.getLayer().batchDraw();
  }, [isSelected]);
  return (
    <>
      <Group
        x={Math.ceil((t.start.getTime() - from.getTime()) / step) * stepWidth}
        y={ind * taskHeight + 6}
        draggable
        ref={shapeRef}
        onDragMove={(e) => {
          e.target.y(ind * taskHeight + 6);
        }}
        clip={{
          x: 0,
          y: 0,
          width:
            Math.ceil((t.end.getTime() - t.start.getTime()) / step) * stepWidth,
          height: taskHeight - 12,
        }}
      >
        <Rect
          x={0}
          y={0}
          onMouseOver={() => {
            setCursorPointer(true);
            setIsSelected(true);
          }}
          onMouseOut={() => {
            setCursorPointer(false);
            setIsSelected(false);
          }}
          width={
            Math.ceil((t.end.getTime() - t.start.getTime()) / step) * stepWidth
          }
          height={taskHeight - 12}
          fill={color}
          cornerRadius={cornerRadius}
        />
        <Text
          x={18}
          y={Math.floor(taskHeight / 2) - 12}
          text={t.name}
          ref={textRef}
          fontSize={12}
          fontFamily={fontFamily}
          onMouseOver={() => {
            setIsSelected(true);
          }}
          onMouseOut={() => {
            setIsSelected(false);
          }}
        />
      </Group>
      <Transformer
        enabledAnchors={isSelected ? ["middle-left", "middle-right"] : []}
        rotateEnabled={false}
        rotateLineVisible={false}
        borderEnabled={false}
        flipEnabled={false}
        onTransform={(e) => {
          textRef.current.scaleX(1 / e.target.scaleX());
          textRef.current.scaleY(1 / e.target.scaleY());
          textRef.current.x(18 / e.target.scaleX());
        }}
        anchorStyleFunc={(anchor) => {
          anchor.height(taskHeight - 16);
          anchor.offsetY(taskHeight / 2 - 8);
          anchor.width(transformAnchorStyle?.width ?? 8);
          anchor.fill(resizeHandleColor);
          if (anchor.hasName("middle-left")) {
            anchor.offsetX(-(transformAnchorStyle?.offsetX ?? 5));
          } else {
            anchor.offsetX((transformAnchorStyle?.offsetX ?? 5) + 10);
          }
        }}
        anchorStroke={resizeHandleColor}
        anchorStrokeWidth={1}
        anchorCornerRadius={transformAnchorStyle?.cornerRadius ?? 8}
        ref={trRef}
        onMouseOver={() => {
          setIsSelected(true);
        }}
        onMouseOut={() => {
          setIsSelected(false);
        }}
      />
    </>
  );
}
