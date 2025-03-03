import { Arrow } from "react-konva";
import { Task } from "./types";
import { Html } from "react-konva-utils";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
export function DependencyShape({
  from,
  fromTask,
  toTask,
  fromIndex,
  toIndex,
  step,
  stepWidth,
  taskHeight,
  setCursorPointer,
  setSelectedDependency,
  selectedDependency,
  onDeleteDependency,
  isEditingEnabled,
}: {
  fromTask: Task;
  toTask: Task;
  fromIndex: number;
  toIndex: number;
  from: Date;
  step: number;
  stepWidth: number;
  taskHeight: number;
  setCursorPointer: (selected: boolean) => void;
  selectedDependency: { from: Task; to: Task } | null;
  setSelectedDependency: (dependency: { from: Task; to: Task } | null) => void;
  onDeleteDependency: () => Promise<void>;
  isEditingEnabled: boolean;
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
  const [isSaving, setIsSaving] = useState(false);

  return (
    <>
      {isEditingEnabled &&
        selectedDependency?.from.id === fromTask.id &&
        selectedDependency?.to.id === toTask.id && (
          <Html
            groupProps={{
              x: toPoint,
              y: lastLine[1] + 2,
            }}
          >
            <Button
              variant="destructive"
              size="icon"
              asChild
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onDeleteDependency();
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div className="h-6 w-6 rounded-sm cursor-pointer">
                {isSaving ? (
                  <Loader2 className="h-8 w-8 animate-spin p-1" />
                ) : (
                  <X className="h-2 w-2" />
                )}
              </div>
            </Button>
          </Html>
        )}
      <Arrow
        points={[...firstLine, ...mainLine, ...lastLine]}
        stroke="black"
        strokeWidth={
          selectedDependency?.from.id === fromTask.id &&
          selectedDependency?.to.id === toTask.id
            ? 3
            : 1
        }
        opacity={0.5}
        pointerLength={5}
        fill="black"
        pointerWidth={5}
      />
      <Arrow
        points={[...firstLine, ...mainLine, ...lastLine]}
        stroke="transparent"
        strokeWidth={4}
        opacity={0.5}
        pointerLength={5}
        pointerWidth={5}
        onMouseEnter={() => setCursorPointer(true)}
        onMouseLeave={() => setCursorPointer(false)}
        onClick={() => {
          if (
            selectedDependency?.from.id === fromTask.id &&
            selectedDependency?.to.id === toTask.id
          ) {
            setSelectedDependency(null);
          } else {
            setSelectedDependency({ from: fromTask, to: toTask });
          }
        }}
      />
    </>
  );
}
