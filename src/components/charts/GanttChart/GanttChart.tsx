/** public component */
import { useMemo } from "react";
import colors from "tailwindcss/colors";
import { Resolution, Task } from "./types";
import { StatelessGanttChart } from "./StatelessGanttChart";
import { GanttToolbar } from "./GanttToolbar";
import { getChartWidthByResolution } from "./utils";
import { TaskShapeStyles } from "./TaskShape";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GanttContextProvider, useGanttContext } from "./GanttContext";
import { EditTaskDialog } from "./EditTaskDialog";

const availableResolutions: Resolution[] = [
  "hour",
  "day",
  "week",
  "month",
  "year",
];

export function GanttChartWithToolbar({
  columns,
  style = {
    taskHeight: 40,
    headerHeight: 60,
    stepWidth: 80,
    taskStyles: {
      taskColor: colors["green"][300],
      fontFamily: "Arial",
      parentTaskColor: colors["blue"][300],
      taskProgressColor: colors["green"][400],
      parentTaskProgressColor: colors["blue"][400],
      cornerRadius: 5,
      taskResizeHandleColor: colors["green"][800],
      transformAnchorStyle: {
        width: 6,
        cornerRadius: 2,
        offsetX: 2,
      },
    },
  },
}: {
  resources: { name: string; id: string }[];
  columns: {
    field: string;
    label: string;
    fieldType?: "date" | "number" | "string";
    render?: (task: Task) => React.ReactNode;
  }[];
  style?: {
    taskHeight?: number;
    stepWidth?: number;
    headerHeight?: number;
    taskStyles?: TaskShapeStyles;
  };
}) {
  const {
    resolution,
    setResolution,
    onCollapseAll,
    tasks,
    editingTask,
    setEditingTask,
    onEditTask,
    resources,
  } = useGanttContext();
  const zoomEnabled = useMemo(() => {
    return (
      !!resolution &&
      availableResolutions.indexOf(resolution) > 0 &&
      getChartWidthByResolution(
        availableResolutions[availableResolutions.indexOf(resolution) - 1],
        tasks,
        style.stepWidth!
      ).chartWidth < 10000
    );
  }, [resolution]);
  return (
    <TooltipProvider>
      <div
        className="flex flex-col gap-0 w-full h-full grow"
        data-testid="gantt-chart"
      >
        {editingTask && (
          <EditTaskDialog
            task={editingTask}
            tasks={tasks}
            resources={resources}
            onTaskChange={async (task) => {
              onEditTask(task);
              setEditingTask(null);
            }}
            onClose={() => {
              setEditingTask(null);
            }}
          />
        )}
        <div className="w-full">
          <GanttToolbar
            actionsEnabled={{
              zoomIn: zoomEnabled,
              zoomOut:
                !!resolution &&
                availableResolutions.indexOf(resolution) <
                  availableResolutions.length - 1,
              expandAll: true,
              collapseAll: true,
            }}
            onZoomIn={() =>
              setResolution(
                availableResolutions[
                  availableResolutions.indexOf(resolution!) - 1
                ]
              )
            }
            onZoomOut={() =>
              setResolution(
                availableResolutions[
                  availableResolutions.indexOf(resolution!) + 1
                ]
              )
            }
            onExpandAll={() => onCollapseAll(false)}
            onCollapseAll={() => onCollapseAll(true)}
          />
        </div>
        <StatelessGanttChart style={style} columns={columns} />
      </div>
    </TooltipProvider>
  );
}

export function GanttChart({
  columns,
  style,
  tasks,
  resources,
  editing,
}: {
  columns: any[];
  style: {
    taskHeight?: number;
    stepWidth?: number;
    headerHeight?: number;
    taskStyles?: TaskShapeStyles;
  };
  tasks: Task[];
  resources: { name: string; id: string }[];
  editing: {
    isEnabled: boolean;
    isBatch: boolean;
  };
}) {
  return (
    <GanttContextProvider
      tasks={tasks}
      stepWidth={style.stepWidth ?? 80}
      editing={editing}
      resources={resources}
    >
      <GanttChartWithToolbar
        columns={columns}
        style={style}
        resources={resources}
      />
    </GanttContextProvider>
  );
}
