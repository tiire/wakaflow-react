import { Resolution, resolutionMap, Task } from "./types";

const resolutionArray: Resolution[] = ["hour", "day", "week", "month", "year"];

export const stepForResolution: Record<Resolution, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function getNextResolution(resolution: Resolution): Resolution {
  if (resolutionArray.indexOf(resolution) === resolutionArray.length - 1) {
    return resolution;
  }
  return resolutionArray[resolutionArray.indexOf(resolution) + 1] ?? resolution;
}

export function getPrevResolution(
  resolution: Resolution,
  tasks: Task[],
  stepWidth: number
): Resolution {
  if (
    resolutionArray.indexOf(resolution) === 0 ||
    getChartWidthByResolution(
      resolutionArray[resolutionArray.indexOf(resolution) - 1],
      tasks,
      stepWidth
    ).chartWidth >= 32000
  ) {
    return resolution;
  }
  return resolutionArray[resolutionArray.indexOf(resolution) - 1] ?? resolution;
}

export function getChartWidthByResolution(
  resolution: "hour" | "day" | "week" | "month" | "year",
  tasks: Task[],
  stepWidth: number
) {
  const minDate = new Date(
    Math.min(
      ...tasks.filter((t) => t.start).map((task) => task.start!.getTime())
    )
  );

  const nextResolution =
    resolutionArray[resolutionArray.indexOf(resolution) + 1] ?? resolution;

  const from = resolutionMap[nextResolution].add(
    resolutionMap[resolution].startOf(minDate),
    -1
  );
  const maxDate = Math.max(
    ...tasks.filter((t) => t.end).map((task) => task.end!.getTime())
  );

  const to = resolutionMap["day"].add(
    resolutionMap[nextResolution].add(
      resolutionMap[resolution].startOfResolution(maxDate),
      2
    ),
    -1
  );

  const pixelInMinResolution =
    stepWidth / resolutionMap[resolution].numberOfMinResolution(minDate);
  const chartWidth =
    resolutionMap[resolution].differenceInMinResolution(from, to) *
    pixelInMinResolution;

  return {
    chartWidth,
    step: stepForResolution[resolutionMap[resolution].minResolution],
    from,
    to,
    minResolution: resolutionMap[resolution].minResolution,
    pixelInMinResolution,
    minDate: resolutionMap[resolution].add(
      resolutionMap[resolution].startOfResolution(minDate),
      -1
    ),
  };
}
