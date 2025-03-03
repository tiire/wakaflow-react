import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from "./types";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multiple-selector";

export function EditTaskDialog({
  task,
  onTaskChange,
  onClose,
  tasks,
  resources,
}: {
  task: Task;
  onTaskChange: (task: Task) => Promise<void>;
  onClose: () => void;
  tasks: Task[];
  resources: { name: string; id: string }[];
}) {
  const [name, setName] = useState(task.name ?? "");
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [assignees, setAssignees] = useState(task.assignees.map((a) => a.id));
  const [dependencies, setDependencies] = useState(task.dependsOn);
  const [isSaving, setIsSaving] = useState(false);
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>{task.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue={task.name ?? ""}
              className="col-span-3"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="progress" className="text-right">
              Progress
            </Label>
            <Input
              id="progress"
              defaultValue={progress}
              className="col-span-3"
              type="number"
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4 w-full">
            <Label htmlFor="dependsOn" className="text-right">
              Depends on
            </Label>
            <div className="col-span-3">
              <MultiSelect
                options={tasks
                  .filter((t) => t.id !== task.id)
                  .map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                onValueChange={setDependencies}
                variant="inverted"
                defaultValue={dependencies}
                placeholder="Select dependencies"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 w-full">
            <Label htmlFor="resources" className="text-right">
              Resources
            </Label>
            <div className="col-span-3">
              <MultiSelect
                options={resources.map((r) => ({
                  label: r.name,
                  value: r.id,
                }))}
                onValueChange={setAssignees}
                variant="inverted"
                defaultValue={assignees}
                placeholder="Select resources"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              try {
                await onTaskChange({
                  ...task,
                  name,
                  progress,
                  dependsOn: dependencies,
                  assignees: assignees.map((a) => ({
                    id: a,
                    name: resources.find((r) => r.id === a)?.name ?? "",
                  })),
                });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
