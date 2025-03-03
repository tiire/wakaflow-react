import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  actionsEnabled?: {
    zoomIn: boolean;
    zoomOut: boolean;
    expandAll: boolean;
    collapseAll: boolean;
  };
  leftToolbar?: React.ReactNode;
}

export function GanttToolbar({
  onZoomIn,
  onZoomOut,
  onExpandAll,
  onCollapseAll,
  leftToolbar,
  actionsEnabled = {
    zoomIn: true,
    zoomOut: true,
    expandAll: true,
    collapseAll: true,
  },
}: ToolbarProps) {
  return (
    <div className="w-full bg-background border-b flex justify-between">
      <div className="container px-4">
        <div className="flex items-center h-12">
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomIn}
                  disabled={!actionsEnabled.zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                  <span className="sr-only">Zoom In</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomOut}
                  disabled={!actionsEnabled.zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                  <span className="sr-only">Zoom Out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExpandAll}
                  disabled={!actionsEnabled.expandAll}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Expand All</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand All</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCollapseAll}
                  disabled={!actionsEnabled.collapseAll}
                >
                  <Minimize2 className="h-4 w-4" />
                  <span className="sr-only">Collapse All</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Collapse All</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      {leftToolbar || <div className="flex-1" />}
    </div>
  );
}
