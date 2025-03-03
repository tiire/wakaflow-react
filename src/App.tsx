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
    assignees: [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
      },
    ],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-15"),
    name: "Task 3",
    id: "Task 3",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [
      {
        id: "2",
        name: "Jane Doe",
        email: "jane.doe@example.com",
      },
      {
        id: "3",
        name: "John Smith",
        email: "john.smith@example.com",
      },
    ],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 4",
    id: "Task 4",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 5",
    id: "Task 5",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 6",
    id: "Task 6",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 7",
    id: "Task 7",
    progress: 0,
    parentId: "Task 1",
    dependsOn: ["Task 2"],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 8",
    id: "Task 8",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 9",
    id: "Task 9",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 10",
    id: "Task 10",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 11",
    id: "Task 11",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 12",
    id: "Task 12",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 13",
    id: "Task 13",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 14",
    id: "Task 14",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 15",
    id: "Task 15",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 16",
    id: "Task 16",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 17",
    id: "Task 17",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-10"),
    name: "Task 18",
    id: "Task 18",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
  {
    start: new Date("2023-10-10"),
    end: new Date("2023-10-12"),
    name: "Task 19",
    id: "Task 19",
    progress: 0,
    parentId: null,
    dependsOn: [],
    assignees: [],
  },
];

const resources = [
  { name: "John Doe", id: "1" },
  { name: "Jane Doe", id: "2" },
  { name: "John Smith", id: "3" },
];

const App: React.FC = () => {
  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        minHeight: "100vh",
        overflowY: "hidden",
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1>Sample Gantt Chart</h1>
      </div>
      <GanttChart
        editing={{
          isEnabled: true,
          isBatch: false,
        }}
        tasks={tasks}
        resources={resources}
        columns={[
          { field: "name", label: "Task Name", fieldType: "string" },
          { field: "progress", label: "Progress (%)", fieldType: "number" },
          { field: "hello", label: "Assignees", fieldType: "array" },
          { field: "hello1", label: "Depends On", fieldType: "array" },
          { field: "hello2", label: "Parent ID", fieldType: "string" },
        ]}
        style={{
          taskHeight: 40,
          stepWidth: 80,
          headerHeight: 60,
        }}
      />
      <div className="flex flex-col gap-4">Footer</div>
    </div>
  );
};

export default App;
