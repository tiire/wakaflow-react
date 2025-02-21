/** public component */
import { useState } from "react";
import colors from "tailwindcss/colors";
import { Resolution, Task } from "./types";
import { StatelessGanttChart } from "./StatelessGanttChart";
import { GanttToolbar } from "./GanttToolbar";
import { getChartWidthByResolution } from "./utils";
import { TaskShapeStyles } from "./TaskShape";

const availableResolutions: Resolution[] = [
  "hour",
  "day",
  "week",
  "month",
  "year",
];

export function GanttChart({
  tasks,
  columns,
  style = {
    taskHeight: 40,
    headerHeight: 60,
    stepWidth: 80,
    taskStyles: {
      taskColor: colors["green"][300],
      fontFamily: "Arial",
      cornerRadius: 5,
      taskResizeHandleColor: colors["blue"][200],
      transformAnchorStyle: {
        width: 10,
        cornerRadius: 5,
        offsetX: 5,
      },
    },
  },
}: {
  tasks: Task[];
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
  const [resolution, setResolution] = useState<Resolution>("day");
  const [collapsedTasks, setCollapsedTasks] = useState<string[]>([]);
  
  return (
    <div className="flex flex-col gap-0 w-full h-full">
      <div className="w-full">
        <GanttToolbar
          actionsEnabled={{
            zoomIn:
              availableResolutions.indexOf(resolution) > 0 &&
              getChartWidthByResolution(
                availableResolutions[
                  availableResolutions.indexOf(resolution) - 1
                ],
                tasks,
                style.stepWidth!
              ).chartWidth < 32000,
            zoomOut:
              availableResolutions.indexOf(resolution) <
              availableResolutions.length - 1,
            expandAll: true,
            collapseAll: true,
          }}
          onZoomIn={() =>
            setResolution(
              availableResolutions[availableResolutions.indexOf(resolution) - 1]
            )
          }
          onZoomOut={() =>
            setResolution(
              availableResolutions[availableResolutions.indexOf(resolution) + 1]
            )
          }
          onExpandAll={() => setCollapsedTasks([])}
          onCollapseAll={() => setCollapsedTasks(tasks.map((task) => task.id))}
        />
      </div>
      <StatelessGanttChart
        tasks={tasks}
        onCollapseTask={(taskId, collapsed) => {
          setCollapsedTasks((prev) => {
            if (collapsed) {
              return [...prev, taskId];
            }
            return prev.filter((id) => id !== taskId);
          });
        }}
        style={style}
        collapsedTasks={collapsedTasks}
        resolution={resolution}
        columns={columns}
      />
    </div>
  );
}
