import { Resolution, resolutionMap, stepForResolution, Task } from "./types";

const resolutionArray: Resolution[] = ["hour", "day", "week", "month", "year"];

export function getTaskUnderMouse(
  mousePos: { x: number; y: number },
  tasks: Task[],
  taskHeight: number,
  stepWidth: number,
  step: number,
  from: Date
) {
  return tasks.find((t, ind) => {
    const isMilestone = t.start!.getTime() === t.end!.getTime();
    const start =
      Math.floor((t.start!.getTime() - from.getTime()) / step) * stepWidth;
    const end = isMilestone
      ? start + 15
      : Math.ceil((t.end!.getTime() - from.getTime()) / step) * stepWidth;
    const yStart = ind * taskHeight;
    const yEnd = yStart + taskHeight;
    return (
      mousePos.x >= start &&
      mousePos.x <= end &&
      mousePos.y >= yStart &&
      mousePos.y <= yEnd
    );
  });
}

export function getDependencyUnderMouse(
  mousePos: { x: number; y: number },
  dependencies: {
    fromTask: Task;
    toTask: Task;
    fromIndex: number;
    toIndex: number;
  }[],
  from: Date,
  stepWidth: number,
  step: number,
  taskHeight: number
) {
  return dependencies.find((d) => {
    const { fromTask, toTask, fromIndex, toIndex } = d;
    const fromPoint =
      Math.floor((fromTask.end!.getTime() - from.getTime()) / step) *
        stepWidth +
      8;
    const toPoint =
      Math.floor((toTask.start!.getTime() - from.getTime()) / step) *
        stepWidth -
      8;
    const firstLine = [
      fromPoint - 6,
      fromIndex * taskHeight + taskHeight / 2,
      fromPoint,
      fromIndex * taskHeight + taskHeight / 2,
    ];
    const mainLine = [
      fromPoint,
      fromIndex > toIndex
        ? fromIndex * taskHeight
        : fromIndex * taskHeight + taskHeight,
      toPoint,
      fromIndex > toIndex
        ? fromIndex * taskHeight
        : fromIndex * taskHeight + taskHeight,
    ];
    const lastLine = [
      toPoint,
      toIndex * taskHeight + taskHeight / 2,
      toPoint + 8,
      toIndex * taskHeight + taskHeight / 2,
    ];
    const rectsAround = [firstLine, mainLine, lastLine].map((line) => {
      return {
        xStart: line[0] - 2,
        yStart: line[1] - 2,
        xEnd: line[2] + 2,
        yEnd: line[3] + 2,
      };
    });
    return rectsAround.some((rect) => {
      return (
        mousePos.x >= rect.xStart &&
        mousePos.x <= rect.xEnd &&
        mousePos.y >= rect.yStart &&
        mousePos.y <= rect.yEnd
      );
    });
  });
}

export function getNextResolution(resolution: Resolution): Resolution {
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

  const from = resolutionMap[nextResolution].startOfResolution(
    resolutionMap[nextResolution].add(
      resolutionMap[resolution].startOf(minDate),
      -1
    )
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

  const pixelInMinResolution = Math.ceil(
    stepWidth / resolutionMap[resolution].numberOfMinResolution(minDate)
  );
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

export const getHeaderCells = (
  fromDate: Date,
  toDate: Date,
  resolution: "hour" | "day" | "week" | "month" | "year"
) => {
  const {
    startOf,
    startOfResolution,
    differenceInMinResolution,
    addMinResolution,
  } = resolutionMap[resolution];

  const hours: Date[] = Array.from(
    { length: differenceInMinResolution(fromDate, toDate) + 1 },
    (_, i) => {
      const date = addMinResolution(fromDate, i);
      return date;
    }
  );

  const cells: { start: Date; end: Date; count: number }[] = hours.reduce(
    (acc, cell) => {
      const start = startOfResolution(cell);
      if (
        !acc.length ||
        acc[acc.length - 1].start.getTime() !== start.getTime()
      ) {
        acc.push({ start, end: cell, count: 1 });
      } else {
        acc[acc.length - 1].end = cell;
        acc[acc.length - 1].count++;
      }
      return acc;
    },
    [] as { start: Date; end: Date; count: number }[]
  );

  const parentCells: { start: Date; end: Date; count: number }[] = hours.reduce(
    (acc, cell) => {
      const start = startOf(cell);
      if (
        !acc.length ||
        acc[acc.length - 1].start.getTime() !== start.getTime()
      ) {
        acc.push({ start, end: cell, count: 1 });
      } else {
        acc[acc.length - 1].end = cell;
        acc[acc.length - 1].count++;
      }
      return acc;
    },
    [] as { start: Date; end: Date; count: number }[]
  );
  return { cells, parentCells };
};
