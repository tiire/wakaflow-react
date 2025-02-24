import React from "react";
import { GanttChart } from "./components/charts/GanttChart/GanttChart";
import { Task } from "./components/charts/GanttChart/types";

const tasks: Task[] = [
  {
    start: new Date("2023-10-01"),
    end: new Date("2023-10-07"),
    name: "Task 1",
    id: "Task 1",
    progress: 50,
    dependsOn: [],
    parentId: null,
    assignees: [],
  },
  {
    start: new Date("2023-10-05"),
    end: new Date("2023-10-12"),
    name: "Task 2",
    id: "Task 2",
    progress: 20,
    dependsOn: [],
    parentId: "Task 1",
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-15"),
    name: "Task 3",
    id: "Task 3",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [],
  },
];

const App: React.FC = () => {
  return (
    <div style={{ padding: "20px", width: "100%", height: "100vh" }}>
      <h1>Sample Gantt Chart</h1>
      <GanttChart
        tasks={tasks}
        columns={[
          { field: "name", label: "Task Name" },
          { field: "progress", label: "Progress (%)" },
        ]}
      />
    </div>
  );
};

export default App;
