import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Loader2, Trash, Plus, Pen } from "lucide-react";
import { Task } from "./types";
import { EditTaskDialog } from "./EditTaskDialog";

export function SelectedActionsToolbar({
  isTaskSelected,
  isDependencySelected,
  onDeleteTask,
  onDeleteDependency,
  isSaving,
  onAddTask,
  onEditTask,
  selectedTask,
  tasks,
  resources,
}: {
  isTaskSelected: boolean;
  isDependencySelected: boolean;
  onDeleteTask: () => void;
  onDeleteDependency: () => void;
  isSaving: boolean;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  selectedTask: Task | null;
  tasks: Task[];
  resources: { name: string; id: string }[];
}) {
  const [isEditOpened, setIsEditOpened] = useState(false);

  return (
    <div className="flex items-center gap-0">
      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSaving}
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add task</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isTaskSelected ? <p>Add subtask</p> : <p>Add task</p>}
        </TooltipContent>
      </Tooltip>
      {isEditOpened && selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          tasks={tasks}
          resources={resources}
          onTaskChange={async (task) => {
            onEditTask(task);
            setIsEditOpened(false);
          }}
          onClose={() => {
            setIsEditOpened(false);
          }}
        />
      )}
      {isTaskSelected && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isSaving}
                onClick={() => setIsEditOpened(true)}
              >
                <Pen className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit task</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isSaving}
                onClick={onDeleteTask}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete task</p>
            </TooltipContent>
          </Tooltip>
        </>
      )}
      {isDependencySelected && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteDependency}
              disabled={!isDependencySelected || isSaving}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete dependency</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
