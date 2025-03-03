import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useComponentSize } from "react-use-size";
import Sticky from "react-sticky-el";

export const GanttLayout = ({
  setGanttPanelWidth,
  setContainerHeight,
  children,
  heightChart,
  headerHeight,
  columns,
  setScroll,
}: {
  setGanttPanelWidth: (width: number) => void;
  setContainerHeight: (height: number) => void;
  heightChart: number;
  headerHeight: number;
  columns: {
    render: () => React.ReactNode;
    renderContent: () => React.ReactNode;
  }[];
  children: React.ReactNode;
  setScroll: ({ left, top }: { left: number; top: number }) => void;
}) => {
  const [scrolledEle, setScrolledEle] = useState<{
    elem: "table" | "gantt";
    scroll: {
      scrollTop: number;
    };
  } | null>(null);

  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollTable = useCallback((e: any) => {
    if (
      scrolledEle?.elem === "table" &&
      Math.abs(
        scrolledEle.scroll.scrollTop - (e.target as HTMLDivElement).scrollTop
      ) < 10
    ) {
      return;
    }
    setScrolledEle({
      elem: "table",
      scroll: {
        scrollTop: (e.target as HTMLDivElement).scrollTop,
      },
    });
  }, []);

  const handleScrollGantt = useCallback((e: any) => {
    if (
      scrolledEle?.elem === "gantt" &&
      Math.abs(
        scrolledEle.scroll.scrollTop - (e.target as HTMLDivElement).scrollTop
      ) < 10
    ) {
      return;
    }
    setScrolledEle({
      elem: "gantt",
      scroll: {
        scrollTop: (e.target as HTMLDivElement).scrollTop,
      },
    });
    setScroll({
      left: e.currentTarget.scrollLeft,
      top: e.currentTarget.scrollTop,
    });
  }, []);

  useEffect(() => {
    if (!scrolledEle) {
      return;
    }
    const top = scrolledEle.scroll.scrollTop;
    if (scrolledEle.elem !== "table") {
      tableScrollRef.current?.removeEventListener("scroll", handleScrollTable);
    } else {
      ganttScrollRef.current?.removeEventListener("scroll", handleScrollGantt);
    }
    const divEl =
      scrolledEle.elem !== "table"
        ? tableScrollRef.current
        : ganttScrollRef.current;
    divEl?.scrollTo({
      behavior: "instant",
      top,
    });
    if (scrolledEle.elem !== "table") {
      tableScrollRef.current?.addEventListener("scroll", handleScrollTable);
    } else {
      ganttScrollRef.current?.addEventListener("scroll", handleScrollGantt);
    }
  }, [scrolledEle?.scroll.scrollTop, scrolledEle?.elem]);

  const {
    ref: containerRef,
    height: containerHeight,
    width: containerWidth,
  } = useComponentSize();

  useEffect(() => {
    setContainerHeight(containerHeight);
  }, [containerHeight]);

  useEffect(() => {
    setGanttPanelWidth(Math.floor(containerWidth * 0.5));
  }, [containerWidth]);

  return (
    <div
      className="flex w-full h-full grow"
      style={{ position: "relative", width: "100%" }}
      ref={containerRef}
    >
      {containerHeight && (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="p-0 md:block hidden" defaultSize={25}>
            <div
              className="h-full scrollarea"
              ref={tableScrollRef}
              onScroll={handleScrollTable}
              style={{
                zIndex: 10,
                minWidth: 400,
                overflowY: "scroll",
                height: containerHeight,
                minHeight: containerHeight,
                maxHeight: containerHeight,
              }}
            >
              <ResizablePanelGroup
                direction="horizontal"
                style={{ height: heightChart + headerHeight }}
              >
                {columns.map((col, ind) => (
                  <React.Fragment key={ind}>
                    <ResizablePanel
                      style={{ height: heightChart + headerHeight }}
                      defaultSize={Math.floor(100 / columns.length)}
                    >
                      <Sticky scrollElement=".scrollarea">
                        <div
                          className="w-full bg-white"
                          style={{ height: headerHeight }}
                        >
                          {col.render()}
                        </div>
                      </Sticky>
                      {col.renderContent()}
                    </ResizablePanel>
                    {ind !== columns.length - 1 && (
                      <ResizableHandle className="w-0 bg-transparent" />
                    )}
                  </React.Fragment>
                ))}
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
          <ResizableHandle className="hidden md:block" />
          <ResizablePanel className="grow" defaultSize={75}>
            <div
              ref={ganttScrollRef}
              onScroll={handleScrollGantt}
              style={{
                overflowY: "auto",
                height: containerHeight,
                minHeight: containerHeight,
                maxHeight: containerHeight,
              }}
            >
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};
