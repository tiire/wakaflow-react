import { useEffect } from "react";
import { useRef, useState } from "react";
import { Html } from "react-konva-utils";
import { Group, Rect, RegularPolygon, Text, Transformer } from "react-konva";
import { Task } from "./types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Group as KonvaGroup } from "konva/lib/Group";

export type TaskShapeStyles = {
  taskColor: string | ((task: Task) => string);
  parentTaskColor: string | ((task: Task) => string); // Added parentTaskColor
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
  onDatesChange,
}: {
  task: Task & { start: Date; end: Date };
  taskHeight: number;
  stepWidth: number;
  ind: number;
  from: Date;
  step: number;
  setCursorPointer: (cursorPointer: boolean) => void;
  styles: TaskShapeStyles;
  onDatesChange: (start: Date, end: Date) => void;
}) {
  const shapeRef = useRef<any | undefined>(undefined);
  const trRef = useRef<any | undefined>(undefined);
  const textRef = useRef<any | undefined>(undefined);
  const tooltipRef = useRef<KonvaGroup | null>(null);
  const rectRef = useRef<any | undefined>(undefined);
  const resizeRectRef = useRef<any | undefined>(undefined);
  const {
    taskColor,
    parentTaskColor, // Added parentTaskColor
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
    if (trRef.current) {
      trRef.current.nodes([resizeRectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, t]);
  const start =
    Math.floor((t.start.getTime() - from.getTime()) / step) * stepWidth;
  const end = Math.ceil((t.end.getTime() - from.getTime()) / step) * stepWidth;

  return (
    <>
      <Group ref={tooltipRef} x={start} y={ind * taskHeight + 6}>
        <Html
          groupProps={{
            x: 200,
            y: 5,
            onMouseOver: () => {
              setCursorPointer(true);
              setIsSelected(true);
            },
            onMouseOut: () => {
              setCursorPointer(false);
              setIsSelected(false);
            },
          }}
        >
          <Popover open={isSelected}>
            <PopoverTrigger asChild>
              <div
                style={{
                  height: taskHeight - 16,
                }}
              ></div>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: 150 }}
              side="top"
              onMouseOver={() => {
                setCursorPointer(true);
                setIsSelected(true);
              }}
              onMouseOut={() => {
                setCursorPointer(false);
                setIsSelected(false);
              }}
            >
              <div className="text-sm font-medium mb-2">{t.name}</div>
              <div className="text-xs text-muted-foreground mb-1">
                Start: {t.start.toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">
                End: {t.end.toLocaleDateString()}
              </div>
            </PopoverContent>
          </Popover>
        </Html>
      </Group>
      <Group
        x={start}
        y={ind * taskHeight + 6}
        clip={{
          x: 0,
          y: 0,
          width: end - start,
          height: taskHeight - 12,
        }}
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
        <Text
          x={18}
          y={Math.floor(taskHeight / 2) - 12}
          text={t.name}
          ref={textRef}
          fontSize={12}
          fontFamily={fontFamily}
        />
      </Group>
      <Group
        x={start}
        y={ind * taskHeight + 6}
        draggable
        ref={shapeRef}
        onDragMove={(e) => {
          e.target.y(ind * taskHeight + 6);
          e.target.x(Math.floor(e.target.x() / stepWidth) * stepWidth);
        }}
        onDragEnd={(e) => {
          const newStart = new Date(
            from.getTime() + Math.floor((e.target.x() * step) / stepWidth)
          );
          const width = t.end.getTime() - t.start.getTime();
          const newEnd = new Date(newStart.getTime() + width);
          onDatesChange(newStart, newEnd);
        }}
      >
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
          onMouseOver={() => {
            setCursorPointer(true);
            setIsSelected(true);
          }}
          onMouseOut={() => {
            setCursorPointer(false);
            setIsSelected(false);
          }}
          onMouseMove={() => {
            var mousePos = shapeRef.current.getStage().getPointerPosition();
            tooltipRef.current?.x(mousePos.x - 200);
          }}
        />
      </Group>

      {isSelected && (
        <Transformer
          enabledAnchors={isSelected ? ["middle-left", "middle-right"] : []}
          rotateEnabled={false}
          rotateLineVisible={false}
          borderEnabled={isSelected ? true : false}
          flipEnabled={false}
          onTransformEnd={(e) => {
            const newStart = new Date(
              from.getTime() +
                Math.floor(
                  ((start + resizeRectRef.current.x()) * step) / stepWidth
                )
            );
            const width =
              (resizeRectRef.current.width() * e.target.scaleX() * step) /
              stepWidth;
            const newEnd = new Date(newStart.getTime() + width);
            onDatesChange(newStart, newEnd);
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
          onMouseOver={() => {
            setIsSelected(true);
          }}
          onMouseOut={() => {
            setIsSelected(false);
          }}
        />
      )}
    </>
  );
}
