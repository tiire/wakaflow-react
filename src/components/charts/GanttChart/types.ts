import {
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  startOfHour,
} from "date-fns";

export type Task = {
  id: string;
  parentId: string | null;
  name: string;
  start?: Date;
  end?: Date;
  dependsOn: string[];
  assignees: string[];
  [key: string]: any;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
};

export type Resolution = "hour" | "day" | "week" | "month" | "year";

export const resolutionMap: Record<
  Resolution,
  {
    format: string;
    add: Function;
    difference: Function;
    startOf: Function;
    parentFormat: string;
    startOfResolution: Function;
    numberOfMinResolution: Function;
    parentNumberOfHours: Function;
    minResolution: Resolution;
    differenceInMinResolution: Function;
    addMinResolution: Function;
  }
> = {
  hour: {
    format: "HH:mm",
    add: addHours,
    difference: differenceInHours,
    startOf: startOfDay,
    parentFormat: "dd MMM",
    startOfResolution: startOfHour,
    numberOfMinResolution: () => 1,
    parentNumberOfHours: () => 24,
    minResolution: "hour",
    differenceInMinResolution: (date: Date, date2: Date) => {
      return differenceInHours(date2, date);
    },
    addMinResolution: (date: Date, count: number) => {
      return addHours(date, count);
    },
  },
  day: {
    format: "dd",
    add: addDays,
    difference: differenceInDays,
    startOf: startOfWeek,
    parentFormat: "dd MMM",
    startOfResolution: startOfDay,
    numberOfMinResolution: () => 24,
    parentNumberOfHours: () => 24 * 7,
    minResolution: "hour",
    differenceInMinResolution: (date: Date, date2: Date) => {
      return differenceInHours(date2, date);
    },
    addMinResolution: (date: Date, count: number) => {
      return addHours(date, count);
    },
  },
  week: {
    format: "dd MMM",
    add: addWeeks,
    difference: differenceInWeeks,
    startOf: startOfMonth,
    parentFormat: "MMM yyyy",
    startOfResolution: startOfWeek,
    numberOfMinResolution: () => 24 * 7,
    parentNumberOfHours: () => 24 * 7 * 4,
    minResolution: "hour",
    differenceInMinResolution: (date: Date, date2: Date) => {
      return differenceInHours(date2, date);
    },
    addMinResolution: (date: Date, count: number) => {
      return addHours(date, count);
    },
  },
  month: {
    format: "MMM",
    add: addMonths,
    difference: differenceInMonths,
    startOf: startOfYear,
    parentFormat: "yyyy",
    startOfResolution: startOfMonth,
    numberOfMinResolution: (date: Date) => {
      const start = startOfMonth(date);
      const end = addMonths(start, 1);
      return differenceInDays(end, start);
    },
    parentNumberOfHours: (date: Date) => {
      const start = startOfYear(date);
      const end = addYears(start, 1);
      return differenceInHours(end, start);
    },
    minResolution: "day",
    differenceInMinResolution: (date: Date, date2: Date) => {
      return differenceInDays(date2, date);
    },
    addMinResolution: (date: Date, count: number) => {
      return addDays(date, count);
    },
  },
  year: {
    format: "yyyy",
    add: addYears,
    difference: differenceInYears,
    startOf: startOfYear,
    parentFormat: "yyyy",
    startOfResolution: startOfYear,
    numberOfMinResolution: (date: Date) => {
      const start = startOfYear(date);
      const end = addYears(start, 1);
      return differenceInDays(end, start);
    },
    parentNumberOfHours: (date: Date) => {
      const start = startOfYear(date);
      const end = addYears(start, 1);
      return differenceInHours(end, start);
    },
    minResolution: "day",
    differenceInMinResolution: (date: Date, date2: Date) => {
      return differenceInDays(date2, date);
    },
    addMinResolution: (date: Date, count: number) => {
      return addDays(date, count);
    },
  },
};
