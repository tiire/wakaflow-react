import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { Resolution, resolutionMap } from "./types";

interface CalendarHeaderProps {
  resolution: Resolution;
  headerHeight: number;
  scrollToDate: number;
  pixelInMinResolution: number;
  cells: { start: Date; end: Date; count: number }[];
  parentCells: { start: Date; end: Date; count: number }[];
}

export function GanttHeader({
  resolution,
  headerHeight,
  scrollToDate,
  pixelInMinResolution,
  cells,
  parentCells,
}: CalendarHeaderProps) {
  const { format: cellFormat, parentFormat } = resolutionMap[resolution];

  useEffect(() => {
    if (cellRef.current) {
      lastCellRef.current?.scrollIntoView({ behavior: "instant" });
      cellRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [resolution]);

  const cellRef = useRef<HTMLTableCellElement>(null);
  const lastCellRef = useRef<HTMLTableCellElement>(null);

  return (
    <div
      className="overflow-x-hidden sticky top-0 bg-white z-10"
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
          {parentCells.map(({ start, end, count }, index) => (
            <div
              key={index}
              style={{
                overflow: "clip",
                minHeight: Math.floor(headerHeight / 2),
                maxHeight: Math.floor(headerHeight / 2),
                lineHeight: `${Math.floor(headerHeight / 2)}px`,
                minWidth: pixelInMinResolution * count,
                maxWidth: pixelInMinResolution * count,
              }}
              className="border-b border-r border-gray-300 text-sm font-semibold text-gray-700 text-center"
            >
              {resolution === "day"
                ? `${format(start, parentFormat)} - ${format(
                    end,
                    parentFormat
                  )}`
                : format(start, parentFormat)}
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
                minWidth: pixelInMinResolution * cell.count,
                maxWidth: pixelInMinResolution * cell.count,
                minHeight: Math.floor(headerHeight / 2),
                maxHeight: Math.floor(headerHeight / 2),
                lineHeight: `${Math.floor(headerHeight / 2)}px`,
                overflow: "hidden",
              }}
              className="border-b border-r border-gray-300 m-auto text-xs font-medium text-gray-600 text-center"
            >
              {resolution === "week"
                ? `${format(cell.start, cellFormat)} - ${format(
                    cell.end,
                    cellFormat
                  )}`
                : format(cell.start, cellFormat)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
