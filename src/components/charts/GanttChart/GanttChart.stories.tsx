import type { Story } from "@ladle/react";
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

// Generate 3 level deep tasks
const generateTasks = () => {
  let tasks = [];
  let taskId = 1;

  // Level 1: Generate 3 parent tasks
  for (let i = 0; i < 3; i++) {
    const student = getRandomItem(students);
    const subject = getRandomItem(subjects);
    const parentId = taskId.toString();
    tasks.push({
      id: parentId,
      parentId: null,
      name: `Project ${i + 1}`,
      start: undefined,
      end: undefined,
      dependsOn: [],
      assignees: [],
      subject: subject,
      student: student,
    });
    taskId++;

    // Level 2: Generate 2-3 sub-tasks for each parent
    const numSubTasks = Math.floor(Math.random() * 2) + 2; // 2-3 subtasks
    for (let j = 0; j < numSubTasks; j++) {
      const subTaskId = taskId.toString();
      tasks.push({
        id: subTaskId,
        parentId: parentId,
        name: `Phase ${i + 1}.${j + 1}`,
        start: undefined,
        end: undefined,
        dependsOn: [],
        assignees: [],
        subject: subject,
        student: student,
      });
      taskId++;

      // Level 3: Generate 2-3 leaf tasks for each sub-task
      const numLeafTasks = Math.floor(Math.random() * 2) + 2; // 2-3 leaf tasks
      for (let k = 0; k < numLeafTasks; k++) {
        const start = getRandomDate(earliestDate, latestDate);
        const end = getRandomDate(start, latestDate);
        tasks.push({
          id: taskId.toString(),
          parentId: subTaskId,
          name: `Task ${i + 1}.${j + 1}.${k + 1}`,
          start: start,
          end: end,
          dependsOn: [],
          assignees: [],
          subject: subject,
          student: student,
        });
        taskId++;
      }
    }
  }
  return tasks;
};

export const GanttChartStory: Story = () => {
  // Helper function to generate random dates within a rang
  const [tasks] = useState<Task[]>(generateTasks());
  return (
    <div style={{ width: "100%", backgroundColor: "red", height: "500px" }}>
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
