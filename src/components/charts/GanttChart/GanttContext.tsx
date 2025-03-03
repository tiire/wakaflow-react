import { createContext, useContext, useMemo, useState } from "react";
import {
  FilledTask,
  Resolution,
  resolutionArray,
  stepForResolution,
  Task,
} from "./types";

export const GanttContext = createContext<{
  editingTask: Task | null;
  taskModificationState?: {
    start: Date;
    end: Date;
    progress: number;
  };
  setTaskModificationState: (
    st:
      | {
          start: Date;
          end: Date;
          progress: number;
        }
      | undefined
  ) => void;
  setEditingTask: (task: Task | null) => void;
  resolution?: Resolution;
  showTaskPopup: boolean;
  setShowTaskPopup: (show: boolean) => void;
  setResolution: (resolution: Resolution) => void;
  setSelectedDependency: (dependency: { from: Task; to: Task } | null) => void;
  setGanttPanelWidth: (width: number) => void;
  setContainerHeight: (height: number) => void;
  selectedTask: Task | null;
  highlightedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  setHighlightedTask: (task: Task | null) => void;
  selectedDependency: { from: Task; to: Task } | null;
  tasks: FilledTask[];
  containerHeight: number;
  ganttPanelWidth?: number;
  tasksTree: FilledTask[];
  editing: {
    isEnabled: boolean;
    isBatch: boolean;
  };
  dependencies: {
    fromTask: Task & {
      start: Date;
      end: Date;
      children: FilledTask[];
    } & {
      level: number;
      collapsed: boolean;
    };
    toTask: Task & {
      start: Date;
      end: Date;
      children: FilledTask[];
    } & {
      level: number;
      collapsed: boolean;
    };
    fromIndex: number;
    toIndex: number;
  }[];
  onToggleCollapse: (id: string, collapsed: boolean) => void;
  onDatesChange: (t: FilledTask, start: Date, end: Date) => void;
  onProgressChange: (t: FilledTask, progress: number) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onDeleteDependency: (dependency: { from: string; to: string }) => void;
  onCollapseAll: (collapsed: boolean) => void;
  onAddDependency: (dependency: { from: string; to: string }) => void;
  sortState: {
    field: string;
    direction: "asc" | "desc";
    sortFunction: (a: FilledTask, b: FilledTask) => number;
  };
  setSortState: (sortState: {
    field: string;
    direction: "asc" | "desc";
    sortFunction: (a: FilledTask, b: FilledTask) => number;
  }) => void;
  onEditTask: (task: Task) => void;
  resources: { name: string; id: string }[];
}>({
  setResolution: () => {},
  setTaskModificationState: () => {},
  showTaskPopup: false,
  setShowTaskPopup: () => {},
  setSelectedDependency: () => {},
  onDeleteTask: () => {},
  setHighlightedTask: () => {},
  highlightedTask: null,
  setSelectedTask: () => {},
  selectedTask: null,
  onAddTask: () => {},
  ganttPanelWidth: 0,
  editing: {
    isEnabled: false,
    isBatch: false,
  },
  editingTask: null,
  setEditingTask: () => {},
  onDeleteDependency: () => {},
  onAddDependency: () => {},
  containerHeight: 0,
  setGanttPanelWidth: () => {},
  setContainerHeight: () => {},
  tasks: [],
  tasksTree: [],
  dependencies: [],
  onToggleCollapse: () => {},
  onDatesChange: () => {},
  onProgressChange: () => {},
  onCollapseAll: () => {},
  selectedDependency: null,
  sortState: {
    field: "start",
    direction: "asc",
    sortFunction: (a, b) => a.start.getTime() - b.start.getTime(),
  },
  setSortState: () => {},
  onEditTask: () => {},
  resources: [],
});

export const useGanttContext = () => {
  return useContext(GanttContext);
};

export const GanttContextProvider = ({
  children,
  tasks,
  stepWidth,
  editing,
  resources,
}: {
  children: React.ReactNode;
  tasks: Task[];
  stepWidth: number;
  editing: {
    isEnabled: boolean;
    isBatch: boolean;
  };
  resources: { name: string; id: string }[];
}) => {
  const [resolution, setResolution] = useState<Resolution>();
  const [ganttPanelWidth, setGanttPanelWidth] = useState<number>();
  const [containerHeight, setContainerHeight] = useState<number>();
  const [collapsedTasks, setCollapsedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [highlightedTask, setHighlightedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<{
    from: Task;
    to: Task;
  } | null>(null);

  const [taskState, setTaskState] = useState(tasks);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const taskTree = useMemo(() => {
    const childrenById: Record<string, { task?: Task; children: string[] }> =
      {};

    taskState.forEach((task) => {
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
      const hasChildren = (children ?? []).length > 0;
      return {
        ...task.task!,
        start: !hasChildren
          ? task.task!.start!
          : new Date(Math.min(...children.map((ch) => ch.start.getTime()))),
        end: !hasChildren
          ? task.task!.end!
          : new Date(Math.max(...children.map((ch) => ch.end.getTime()))),
        children,
      };
    };
    return Object.values(childrenById)
      .filter((t) => !t.task?.parentId)
      .map((t) => getFilledTask(t));
  }, [taskState]);

  const [sortState, setSortState] = useState<{
    field: string;
    direction: "asc" | "desc";
    sortFunction: (a: FilledTask, b: FilledTask) => number;
  }>({
    field: "start",
    direction: "asc",
    sortFunction: (a, b) => a.start.getTime() - b.start.getTime(),
  });

  const [taskModificationState, setTaskModificationState] = useState<
    | {
        start: Date;
        end: Date;
        progress: number;
      }
    | undefined
  >();

  const { sortedTasks, dependencies } = useMemo(() => {
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
          task.children.sort((a, b) =>
            sortState.direction === "asc"
              ? sortState.sortFunction(a, b)
              : sortState.sortFunction(b, a)
          ),
          level + 1
        );
      });
    };
    pushTasks(
      taskTree.sort((a, b) =>
        sortState.direction === "asc"
          ? sortState.sortFunction(a, b)
          : sortState.sortFunction(b, a)
      )
    );
    const dependencies = sorted
      .map((t, ind) => {
        const deps = t.dependsOn.map((d) => {
          const depIndex = sorted.findIndex((t) => t.id === d);
          return {
            fromTask: sorted[depIndex],
            toTask: t,
            fromIndex: depIndex,
            toIndex: ind,
          };
        });
        return deps;
      })
      .flat();
    return { sortedTasks: sorted, dependencies };
  }, [taskTree, collapsedTasks, sortState]);

  const currentResolution = useMemo(() => {
    if (resolution) {
      return resolution;
    }
    if (!ganttPanelWidth) {
      return undefined;
    }

    const minTime = Math.min(...taskTree.map((t) => t.start.getTime()));
    const maxTime = Math.max(...taskTree.map((t) => t.end.getTime()));
    const width = ganttPanelWidth ?? 0;

    let bestResolution: Resolution = "week";
    for (const res of resolutionArray) {
      const supposedWidth =
        ((maxTime - minTime) / stepForResolution[res]) * stepWidth;
      if (supposedWidth <= width) {
        bestResolution = res;
        break;
      }
    }
    return bestResolution;
  }, [ganttPanelWidth, resolution, taskTree]);

  const ctx = useMemo(() => {
    return {
      resolution: currentResolution,
      setResolution,
      setGanttPanelWidth: (width: number) => {
        if (!ganttPanelWidth) {
          setGanttPanelWidth(width);
        }
      },
      setContainerHeight: (height: number) => {
        if (!containerHeight) {
          setContainerHeight(height);
        }
      },
      sortState,
      setSortState,
      containerHeight: containerHeight ?? 0,
      tasks: sortedTasks,
      tasksTree: taskTree,
      dependencies,
      onAddTask: () => {
        const newTask = {
          id: `${Date.now()}`,
          parentId: selectedTask?.id ?? null,
          name: "New Task",
          dependsOn: [],
          assignees: [],
          start:
            selectedTask?.start ??
            new Date(
              Math.min(
                ...taskTree.map((t) => t.start.getTime()),
                ...[
                  taskState.length === 0
                    ? new Date().getTime()
                    : taskState[0].start?.getTime() ?? new Date().getTime(),
                  taskState.length === 0
                    ? new Date().getTime()
                    : taskState[0].start?.getTime() ?? new Date().getTime(),
                ]
              )
            ),
          end:
            selectedTask?.end ??
            new Date(
              Math.max(
                ...taskTree.map((t) => t.end.getTime()),
                ...[
                  taskState.length === 0
                    ? new Date().getTime() + 1000 * 60 * 60 * 24
                    : taskState[0].end?.getTime() ??
                      new Date().getTime() + 1000 * 60 * 60 * 24,
                  taskState.length === 0
                    ? new Date().getTime() + 1000 * 60 * 60 * 24
                    : taskState[0].end?.getTime() ??
                      new Date().getTime() + 1000 * 60 * 60 * 24,
                ]
              )
            ),
        };
        setTaskState([newTask, ...taskState]);
      },
      onToggleCollapse: (id: string, collapsed: boolean) => {
        setCollapsedTasks((prev) =>
          collapsed ? [...prev, id] : prev.filter((t) => t !== id)
        );
      },
      onDeleteTask: (taskId: string) => {
        const allChildren = [taskId];
        while (true) {
          const children = taskState.filter(
            (t) =>
              t.parentId &&
              allChildren.includes(t.parentId) &&
              !allChildren.includes(t.id)
          );
          if (children.length === 0) {
            break;
          }
          allChildren.push(...children.map((c) => c.id));
        }
        setTaskState(
          taskState
            .filter((t) => !allChildren.includes(t.id))
            .map((t) => ({
              ...t,
              dependsOn: t.dependsOn.filter((d) => !allChildren.includes(d)),
            }))
        );
        setSelectedTask(null);
      },
      onDeleteDependency: (dependency: { from: string; to: string }) => {
        setTaskState(
          taskState.map((t) => ({
            ...t,
            dependsOn:
              dependency.to !== t.id
                ? t.dependsOn
                : t.dependsOn.filter((d) => d !== dependency.from),
          }))
        );
        setSelectedDependency(null);
      },
      onDatesChange: (t: FilledTask, start: Date, end: Date) => {
        setTaskModificationState(undefined);
        // if the task has children, update the children's start and end dates
        const task = sortedTasks.find((task) => t.id === task.id);
        const changeStartInMin = Math.floor(
          ((task?.start.getTime() ?? 0) - start.getTime()) / 1000 / 60
        );
        const changeEndInMin = Math.floor(
          ((task?.end.getTime() ?? 0) - end.getTime()) / 1000 / 60
        );
        if ((task?.children?.length ?? 0) > 0) {
          if (changeStartInMin === changeEndInMin) {
            const change = start.getTime() - task!.start!.getTime();
            const updateChildren = (task: FilledTask): FilledTask[] => {
              const kids = task.children.map(updateChildren).flat();
              return [
                ...kids,
                {
                  ...task,
                  start: new Date(task.start!.getTime() + change),
                  end: new Date(task.end!.getTime() + change),
                },
              ];
            };
            const updatedChildren = updateChildren(task!);
            const updatedById = updatedChildren.reduce((acc, child) => {
              acc[child.id] = child;
              return acc;
            }, {} as Record<string, FilledTask>);
            const newTasks = tasks.map((tt) =>
              updatedById[tt.id] ? updatedById[tt.id] : tt
            );
            setTaskState(newTasks);
          } else {
            const updatedTask = {
              ...task!,
              start: start,
              end: end,
            };
            const updated: FilledTask[] = [updatedTask];
            const updateChildren = (upTask: FilledTask): void => {
              if (upTask.children.length === 0) {
                return;
              }
              const first = {
                ...upTask.children[0],
                start: upTask.start,
              };
              if (upTask.children.length > 1) {
                const last = {
                  ...upTask.children[upTask.children.length - 1],
                  end: upTask.end,
                };
                if (first.start.getTime() > first.end.getTime()) {
                  const temp = first.start;
                  first.start = first.end;
                  first.end = temp;
                }
                if (last.start.getTime() > last.end.getTime()) {
                  const temp = last.start;
                  last.start = last.end;
                  last.end = temp;
                }
                updated.push(first);
                updated.push(last);
                updateChildren(first);
              } else {
                const last = { ...first, end: upTask.end };
                if (last.start.getTime() > last.end.getTime()) {
                  const temp = last.start;
                  last.start = last.end;
                  last.end = temp;
                }
                updated.push(last);
                updateChildren(last);
              }
            };
            updateChildren(updatedTask);
            const updatedById = updated.reduce((acc, child) => {
              acc[child.id] = child;
              return acc;
            }, {} as Record<string, FilledTask>);
            setTaskState(
              taskState.map((tt) =>
                updatedById[tt.id] ? updatedById[tt.id] : tt
              )
            );
          }
        } else {
          setTaskState(
            taskState.map((tt) => (t.id === tt.id ? { ...tt, start, end } : tt))
          );
        }
      },
      onProgressChange: (t: FilledTask, progress: number) => {
        setTaskModificationState(undefined);
        setTaskState(
          taskState.map((tt) => (t.id === tt.id ? { ...tt, progress } : tt))
        );
      },
      onCollapseAll: (collapsed: boolean) => {
        setCollapsedTasks(collapsed ? taskState.map((t) => t.id) : []);
      },
      setSelectedDependency: (dependency: { from: Task; to: Task } | null) => {
        setSelectedDependency(dependency);
      },
      setSelectedTask: (task: Task | null) => {
        setSelectedTask(task);
        if (!task) {
          setSelectedDependency(null);
        }
      },
      selectedTask,
      editing,
      selectedDependency,
      onAddDependency: (dependency: { from: string; to: string }) => {
        setTaskState(
          taskState.map((t) => ({
            ...t,
            dependsOn:
              t.id === dependency.to
                ? [...t.dependsOn, dependency.from]
                : t.dependsOn,
          }))
        );
      },
      onEditTask: (task: Task) => {
        setTaskState(taskState.map((t) => (t.id === task.id ? task : t)));
      },
      resources,
      ganttPanelWidth,
      highlightedTask,
      setHighlightedTask,
      editingTask,
      setEditingTask,
      showTaskPopup,
      setShowTaskPopup: (show: boolean) => {
        setShowTaskPopup(show);
        console.log("SHOW TASK POPUP", show);
      },
      taskModificationState,
      setTaskModificationState,
    };
  }, [
    currentResolution,
    setResolution,
    ganttPanelWidth,
    containerHeight,
    taskModificationState,
    setTaskModificationState,
    taskTree,
    collapsedTasks,
    sortState,
    taskState,
    dependencies,
    ganttPanelWidth,
    sortedTasks,
    selectedTask,
    setSelectedTask,
    selectedDependency,
    highlightedTask,
    editingTask,
    setEditingTask,
    setHighlightedTask,
    setSelectedDependency,
    showTaskPopup,
    setShowTaskPopup,
    editing,
    resources,
  ]);
  return <GanttContext.Provider value={ctx}>{children}</GanttContext.Provider>;
};
