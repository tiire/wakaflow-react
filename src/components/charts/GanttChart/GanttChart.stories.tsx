import type { Story } from "@ladle/react";
import { format } from "date-fns";
import { useState } from "react";
import { Task } from "./types";
import { GanttChart } from "./GanttChart";

const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Set date range boundaries (e.g., last 30 days to next 30 days)
const earliestDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
const latestDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);

// Add arrays for random selection
const students = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Sarah Williams",
  "Alex Brown",
];

const subjects = [
  "Math",
  "Science",
  "English",
  "History",
  "Physics",
  "Chemistry",
];

// Helper function to get random item from array
const getRandomItem = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

// // Generate 3 level deep tasks
// const generateTasks = () => {
//   let tasks = [];
//   let taskId = 1;

//   // Level 1: Generate 3 parent tasks
//   for (let i = 0; i < 3; i++) {
//     const student = getRandomItem(students);
//     const subject = getRandomItem(subjects);
//     const parentId = taskId.toString();
//     tasks.push({
//       id: parentId,
//       parentId: null,
//       name: `Project ${i + 1}`,
//       start: undefined,
//       end: undefined,
//       dependsOn: [],
//       assignees: [],
//       subject: subject,
//       student: student,
//     });
//     taskId++;

//     // Level 2: Generate 2-3 sub-tasks for each parent
//     const numSubTasks = Math.floor(Math.random() * 2) + 2; // 2-3 subtasks
//     for (let j = 0; j < numSubTasks; j++) {
//       const subTaskId = taskId.toString();
//       tasks.push({
//         id: subTaskId,
//         parentId: parentId,
//         name: `Phase ${i + 1}.${j + 1}`,
//         start: undefined,
//         end: undefined,
//         dependsOn: [],
//         assignees: [],
//         subject: subject,
//         student: student,
//       });
//       taskId++;

//       // Level 3: Generate 2-3 leaf tasks for each sub-task
//       const numLeafTasks = Math.floor(Math.random() * 2) + 2; // 2-3 leaf tasks
//       for (let k = 0; k < numLeafTasks; k++) {
//         const start = getRandomDate(earliestDate, latestDate);
//         const end = getRandomDate(start, latestDate);
//         tasks.push({
//           id: taskId.toString(),
//           parentId: subTaskId,
//           name: `Task ${i + 1}.${j + 1}.${k + 1}`,
//           start: start,
//           end: end,
//           dependsOn: [],
//           assignees: [],
//           subject: subject,
//           student: student,
//         });
//         taskId++;
//       }
//     }
//   }
//   return tasks;
// };

export const GanttChartStory: Story = () => {
  // Helper function to generate random dates within a rang
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      parentId: null,
      name: "Project 1",
      dependsOn: [],
      assignees: [],
      subject: "English",
      student: "John Doe",
    },
    {
      id: "2",
      parentId: "1",
      name: "Phase 1.1",
      dependsOn: [],
      assignees: [],
      subject: "English",
      student: "John Doe",
    },
    {
      id: "3",
      parentId: "2",
      name: "Task 1.1.1",
      start: new Date("2025-01-02T10:05:35.483Z"),
      end: new Date("2025-01-08T22:08:06.908Z"),
      dependsOn: [],
      assignees: [],
      subject: "English",
      student: "John Doe",
    },
    {
      id: "4",
      parentId: "2",
      dependsOn: ["3"],
      name: "Task 1.1.2",
      start: new Date("2025-01-31T16:37:57.706Z"),
      end: new Date("2025-03-12T10:03:21.375Z"),
      assignees: [],
      subject: "English",
      student: "John Doe",
    },
    {
      id: "5",
      parentId: "2",
      name: "Task 1.1.3",
      start: new Date("2025-03-13T10:03:21.375Z"),
      end: new Date("2025-03-23T14:31:37.451Z"),
      dependsOn: ["4"],
      assignees: [],
      subject: "English",
      student: "John Doe",
    },
    // {
    //   id: "6",
    //   parentId: "1",
    //   name: "Phase 1.2",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "7",
    //   parentId: "6",
    //   name: "Task 1.2.1",
    //   start: new Date("2025-03-04T11:23:40.463Z"),
    //   end: new Date("2025-03-14T06:47:15.467Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "8",
    //   parentId: "6",
    //   name: "Task 1.2.2",
    //   start: new Date("2025-03-21T08:38:51.034Z"),
    //   end: new Date("2025-03-22T08:50:56.426Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "9",
    //   parentId: "6",
    //   name: "Task 1.2.3",
    //   start: new Date("2025-02-02T09:39:37.085Z"),
    //   end: new Date("2025-03-17T05:59:35.245Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "10",
    //   parentId: "1",
    //   name: "Phase 1.3",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "11",
    //   parentId: "10",
    //   name: "Task 1.3.1",
    //   start: new Date("2025-03-03T12:24:55.849Z"),
    //   end: new Date("2025-03-06T05:58:58.392Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "12",
    //   parentId: "10",
    //   name: "Task 1.3.2",
    //   start: new Date("2025-01-25T06:50:45.817Z"),
    //   end: new Date("2025-03-22T23:53:38.208Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "13",
    //   parentId: "10",
    //   name: "Task 1.3.3",
    //   start: new Date("2025-03-03T18:43:35.607Z"),
    //   end: new Date("2025-03-10T18:10:31.120Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "English",
    //   student: "John Doe",
    // },
    // {
    //   id: "14",
    //   parentId: null,
    //   name: "Project 2",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "15",
    //   parentId: "14",
    //   name: "Phase 2.1",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "16",
    //   parentId: "15",
    //   name: "Task 2.1.1",
    //   start: new Date("2025-02-15T21:41:04.884Z"),
    //   end: new Date("2025-03-05T19:11:06.446Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "17",
    //   parentId: "15",
    //   name: "Task 2.1.2",
    //   start: new Date("2025-02-22T07:07:37.054Z"),
    //   end: new Date("2025-03-09T14:59:49.077Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "18",
    //   parentId: "15",
    //   name: "Task 2.1.3",
    //   start: new Date("2025-03-07T12:30:12.466Z"),
    //   end: new Date("2025-03-20T17:03:48.784Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "19",
    //   parentId: "14",
    //   name: "Phase 2.2",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "20",
    //   parentId: "19",
    //   name: "Task 2.2.1",
    //   start: new Date("2025-02-16T02:08:53.152Z"),
    //   end: new Date("2025-02-27T13:39:04.681Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "21",
    //   parentId: "19",
    //   name: "Task 2.2.2",
    //   start: new Date("2025-03-05T20:40:45.694Z"),
    //   end: new Date("2025-03-16T22:11:12.235Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Math",
    //   student: "Mike Johnson",
    // },
    // {
    //   id: "22",
    //   parentId: null,
    //   name: "Project 3",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "23",
    //   parentId: "22",
    //   name: "Phase 3.1",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "24",
    //   parentId: "23",
    //   name: "Task 3.1.1",
    //   start: new Date("2025-02-03T10:54:18.254Z"),
    //   end: new Date("2025-03-06T18:11:29.004Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "25",
    //   parentId: "23",
    //   name: "Task 3.1.2",
    //   start: new Date("2025-02-20T04:52:25.184Z"),
    //   end: new Date("2025-02-25T03:20:26.543Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "26",
    //   parentId: "23",
    //   name: "Task 3.1.3",
    //   start: new Date("2025-01-27T23:52:36.642Z"),
    //   end: new Date("2025-02-10T04:17:37.545Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "27",
    //   parentId: "22",
    //   name: "Phase 3.2",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "28",
    //   parentId: "27",
    //   name: "Task 3.2.1",
    //   start: new Date("2025-03-16T01:57:57.094Z"),
    //   end: new Date("2025-03-19T15:57:34.540Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "29",
    //   parentId: "27",
    //   name: "Task 3.2.2",
    //   start: new Date("2025-02-16T17:25:35.890Z"),
    //   end: new Date("2025-02-23T16:55:43.049Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "30",
    //   parentId: "22",
    //   name: "Phase 3.3",
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "31",
    //   parentId: "30",
    //   name: "Task 3.3.1",
    //   start: new Date("2025-03-13T13:37:27.997Z"),
    //   end: new Date("2025-03-20T22:14:43.375Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
    // {
    //   id: "32",
    //   parentId: "30",
    //   name: "Task 3.3.2",
    //   start: new Date("2025-02-28T16:01:25.512Z"),
    //   end: new Date("2025-03-23T21:11:27.566Z"),
    //   dependsOn: [],
    //   assignees: [],
    //   subject: "Science",
    //   student: "Alex Brown",
    // },
  ]);
  console.log(
    tasks
      .filter((t) => t.start)
      .map(
        (t) =>
          `${t.name}: ${format(t.end!, "yyyy-MM-dd HH:mm:ss")}, ${format(
            t.start!,
            "yyyy-MM-dd HH:mm:ss"
          )}`
      )
  );
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <GanttChart
        tasks={tasks}
        columns={[
          { field: "name", label: "Name" },
          {
            field: "student",
            label: "Student",
          },
          {
            field: "subject",
            label: "Subject",
          },
        ]}
      />
    </div>
  );
};
