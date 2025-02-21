import { Resolution, Task } from "./types";

const resolutionArray: Resolution[] = ["hour", "day", "week", "month", "year"];

const stepForResolution: Record<Resolution, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function getChartWidthByResolution(
  resolution: "hour" | "day" | "week" | "month" | "year",
  tasks: Task[],
  stepWidth: number
) {
  const step = stepForResolution[resolution];

  const minDate = new Date(
    Math.min(
      ...tasks.filter((t) => t.start).map((task) => task.start!.getTime())
    )
  );
  const nextResolution =
    resolutionArray[resolutionArray.indexOf(resolution) + 1] ?? resolution;
  minDate.setHours(0, 0, 0, 0);
  const from = new Date(minDate.getTime() - stepForResolution[nextResolution]);
  from.setHours(0, 0, 0, 0);

  let to = new Date(
    Math.max(...tasks.filter((t) => t.end).map((task) => task.end!.getTime()))
  );
  to.setHours(23, 59, 59, 999);
  to = new Date(to.getTime() + stepForResolution[nextResolution]);
  const range = to.getTime() - from.getTime();
  const steps = Math.ceil(range / step);
  const chartWidth = steps * stepWidth;
  return {
    chartWidth,
    step,
    from,
    to,
    minDate: new Date(from.getTime() + stepForResolution[nextResolution]),
  };
}
