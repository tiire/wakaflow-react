import { Pen, Trash } from "lucide-react";
import { Group } from "react-konva";

import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";

import { X } from "lucide-react";
import { PopoverTrigger } from "@/components/ui/popover";
import { Popover } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { Html } from "react-konva-utils";
import { useGanttContext } from "./GanttContext";

export function TaskPopup({
  mousePos,
  taskHeight,
  from,
  step,
  stepWidth,
}: {
  mousePos: { x: number; y: number };
  from: Date;
  taskHeight: number;
  step: number;
  stepWidth: number;
}) {
  const {
    showTaskPopup,
    setShowTaskPopup,
    highlightedTask,
    setHighlightedTask,
    setEditingTask,
    onAddTask,
    onDeleteTask,
    tasks,
    selectedTask,
  } = useGanttContext();

  const hoverHandler = {
    onMouseLeave: () => setHighlightedTask(null),
    onMouseEnter: () => setHighlightedTask(highlightedTask),
  };
  if (!selectedTask) {
    return null;
  }
  const start =
    Math.floor((selectedTask.start!.getTime() - from.getTime()) / step) *
    stepWidth;
  const isMilestone =
    selectedTask.start?.getTime() === selectedTask.end?.getTime();
  const end = isMilestone
    ? start + 15
    : Math.ceil((selectedTask.end!.getTime() - from.getTime()) / step) *
      stepWidth;
  const ind = tasks.findIndex((t) => t.id === selectedTask.id);

  return (
    <Group
      x={mousePos.x > start && mousePos.x < end ? mousePos.x : start}
      y={ind * taskHeight + 20}
      {...hoverHandler}
    >
      <Html
        groupProps={{
          x: 0,
          y: 0,
          ...hoverHandler,
        }}
      >
        <Popover open={showTaskPopup}>
          <PopoverTrigger asChild>
            <div
              style={{
                width: 0,
                height: taskHeight,
              }}
            ></div>
          </PopoverTrigger>
          <PopoverContent style={{ width: 150 }} side="top" {...hoverHandler}>
            <div className="flex w-full justify-between items-center">
              <div className="text-sm font-medium">{selectedTask.name}</div>
              <Button
                variant="ghost"
                size="icon"
                asChild
                onClick={() => setShowTaskPopup(false)}
              >
                <div className="h-6 w-6 rounded-sm cursor-pointer">
                  <X className="h-2 w-2" />
                </div>
              </Button>
            </div>
            <div className="h-2"></div>
            <div className="text-xs text-muted-foreground mb-1">
              Start: {selectedTask.start!.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              End: {selectedTask.end!.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Progress: {selectedTask.progress}%
            </div>
            <div className="h-2"></div>
            <Separator />
            <div className="h-2"></div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild onClick={onAddTask}>
                <div className="h-6 w-6 rounded-sm cursor-pointer">
                  <Plus className="h-2 w-2" />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                onClick={() => setEditingTask(highlightedTask)}
              >
                <div className="h-6 w-6 rounded-sm cursor-pointer">
                  <Pen className="h-2 w-2" />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                onClick={() => onDeleteTask(selectedTask.id)}
              >
                <div className="h-6 w-6 rounded-sm cursor-pointer">
                  <Trash className="h-2 w-2" />
                </div>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Html>
    </Group>
  );
}
