import { Arrow } from "react-konva";
import { Task } from "./types";

export function DependencyShape({
  from,
  fromTask,
  toTask,
  fromIndex,
  toIndex,
  step,
  stepWidth,
  taskHeight,
}: {
  fromTask: Task;
  toTask: Task;
  fromIndex: number;
  toIndex: number;
  from: Date;
  step: number;
  stepWidth: number;
  taskHeight: number;
}) {
  const fromPoint =
    Math.floor((fromTask.end!.getTime() - from.getTime()) / step) * stepWidth +
    8;
  const toPoint =
    Math.floor((toTask.start!.getTime() - from.getTime()) / step) * stepWidth -
    8;
  const firstLine = [
    fromPoint - 6,
    fromIndex * taskHeight + taskHeight / 2,
    fromPoint,
    fromIndex * taskHeight + taskHeight / 2,
  ];
  const mainLine = [
    fromPoint,
    fromIndex > toIndex
      ? fromIndex * taskHeight
      : fromIndex * taskHeight + taskHeight,
    toPoint,
    fromIndex > toIndex
      ? fromIndex * taskHeight
      : fromIndex * taskHeight + taskHeight,
  ];
  const lastLine = [
    toPoint,
    toIndex * taskHeight + taskHeight / 2,
    toPoint + 8,
    toIndex * taskHeight + taskHeight / 2,
  ];
  return (
    <Arrow
      points={[...firstLine, ...mainLine, ...lastLine]}
      stroke="black"
      strokeWidth={1}
      fill="black"
      opacity={0.5}
      pointerLength={5}
      pointerWidth={5}
    />
  );
}
