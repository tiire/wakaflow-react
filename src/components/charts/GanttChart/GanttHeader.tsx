import {
  format,
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
} from "date-fns";
import { Resolution } from "./types";
import { useEffect, useRef } from "react";

interface CalendarHeaderProps {
  resolution: Resolution;
  fromDate: Date;
  toDate: Date;
  taskHeight: number;
  stepWidth: number;
  chartWidth: number;
  headerHeight: number;
  scrollToDate: number;
}

const resolutionMap: Record<
  Resolution,
  {
    format: string;
    add: Function;
    difference: Function;
    startOf: Function;
    parentFormat: string;
  }
> = {
  hour: {
    format: "HH:mm",
    add: addHours,
    difference: differenceInHours,
    startOf: startOfDay,
    parentFormat: "dd MMM",
  },
  day: {
    format: "dd",
    add: addDays,
    difference: differenceInDays,
    startOf: startOfWeek,
    parentFormat: "dd MMM",
  },
  week: {
    format: "dd MMM",
    add: addWeeks,
    difference: differenceInWeeks,
    startOf: startOfMonth,
    parentFormat: "MMM yyyy",
  },
  month: {
    format: "MMM",
    add: addMonths,
    difference: differenceInMonths,
    startOf: startOfYear,
    parentFormat: "yyyy",
  },
  year: {
    format: "yyyy",
    add: addYears,
    difference: differenceInYears,
    startOf: (date: Date) => date,
    parentFormat: "yyyy",
  },
};

export function GanttHeader({
  resolution,
  fromDate,
  toDate,
  headerHeight,
  stepWidth,
  chartWidth,
  scrollToDate,
}: CalendarHeaderProps) {
  const {
    format: cellFormat,
    add,
    difference,
    startOf,
    parentFormat,
  } = resolutionMap[resolution];

  const cellCount = difference(toDate, fromDate) + 1;
  const cells: Date[] = Array.from({ length: cellCount }, (_, i) =>
    add(fromDate, i)
  );
  const cellRef = useRef<HTMLTableCellElement>(null);
  const lastCellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (cellRef.current) {
      lastCellRef.current?.scrollIntoView({ behavior: "instant" });
      cellRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  const parentCells: { start: Date; end: Date; count: number }[] = cells.reduce(
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

  return (
    <div className="overflow-x-hidden" style={{ width: chartWidth }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ height: Math.floor(headerHeight / 2) }}>
            {parentCells.map(({ start, end, count }, index) => (
              <th
                key={index}
                colSpan={count}
                className="border border-gray-300 bg-gray-100  text-sm font-semibold text-gray-700"
              >
                {format(start, parentFormat)}
                {resolution === "day" &&
                  start !== end &&
                  ` - ${format(end, parentFormat)}`}
              </th>
            ))}
          </tr>
          <tr style={{ height: Math.floor(headerHeight / 2) }}>
            {cells.map((cell, index) => (
              <th
                key={index}
                ref={
                  cell.getTime() === scrollToDate
                    ? cellRef
                    : index == cells.length - 1
                    ? lastCellRef
                    : undefined
                }
                style={{
                  minWidth: stepWidth,
                }}
                className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600"
              >
                {format(cell, cellFormat)}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}
