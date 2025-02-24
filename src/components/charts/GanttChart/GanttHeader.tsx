import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { Resolution, resolutionMap } from "./types";

interface CalendarHeaderProps {
  resolution: Resolution;
  fromDate: Date;
  toDate: Date;
  headerHeight: number;
  scrollToDate: number;
  pixelInMinResolution: number;
}

export function GanttHeader({
  resolution,
  fromDate,
  toDate,
  headerHeight,
  scrollToDate,
  pixelInMinResolution,
}: CalendarHeaderProps) {
  const {
    format: cellFormat,
    startOf,
    parentFormat,
    startOfResolution,
    differenceInMinResolution,
    addMinResolution,
  } = resolutionMap[resolution];

  useEffect(() => {
    if (cellRef.current) {
      lastCellRef.current?.scrollIntoView({ behavior: "instant" });
      cellRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [resolution]);

  const hours: Date[] = Array.from(
    { length: differenceInMinResolution(fromDate, toDate) + 1 },
    (_, i) => addMinResolution(fromDate, i)
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

  const cellRef = useRef<HTMLTableCellElement>(null);
  const lastCellRef = useRef<HTMLTableCellElement>(null);

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

  return (
    <div
      className="overflow-x-hidden"
      style={{
        minWidth:
          pixelInMinResolution *
          parentCells.reduce((acc, cell) => acc + cell.count, 0),
        maxWidth:
          pixelInMinResolution *
          parentCells.reduce((acc, cell) => acc + cell.count, 0),
      }}
    >
      <div
        className="w-full"
        style={{
          minHeight: headerHeight,
          maxHeight: headerHeight,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: Math.floor(headerHeight / 2),
            maxHeight: Math.floor(headerHeight / 2),
          }}
        >
          {parentCells.map(({ start, count }, index) => (
            <div
              key={index}
              style={{
                overflow: "clip",
                minHeight: Math.floor(headerHeight / 2),
                maxHeight: Math.floor(headerHeight / 2),
                minWidth: Math.floor(pixelInMinResolution * count),
                maxWidth: Math.floor(pixelInMinResolution * count),
              }}
              className="border-b border-r border-gray-300 bg-gray-100 text-sm font-semibold text-gray-700"
            >
              {format(start, parentFormat)}
            </div>
          ))}
        </div>
        <div
          style={{
            minHeight: Math.floor(headerHeight / 2),
            maxHeight: Math.floor(headerHeight / 2),
            display: "flex",
          }}
        >
          {cells.map((cell, index) => (
            <div
              key={index}
              ref={
                cell.start.getTime() === scrollToDate
                  ? cellRef
                  : index == cells.length - 1
                  ? lastCellRef
                  : undefined
              }
              style={{
                minWidth: Math.floor(pixelInMinResolution * cell.count),
                maxWidth: Math.floor(pixelInMinResolution * cell.count),
                minHeight: Math.floor(headerHeight / 2),
                maxHeight: Math.floor(headerHeight / 2),
                overflow: "clip",
              }}
              className="border-b border-r border-gray-300 bg-gray-50 m-auto text-xs font-medium text-gray-600"
            >
              {format(cell.start, cellFormat)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
