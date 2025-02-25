"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function InlineEdit({
  value,
  onSave,
  className,
  style,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 w-full">
        <Input
          ref={inputRef}
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-white flex-grow w-full border-none rounded-none focus-visible:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-0"
          onBlur={handleSave}
        />
        <Button onClick={handleSave} size="icon" variant="ghost">
          <Check className="h-4 w-4" />
          <span className="sr-only">Save</span>
        </Button>
        <Button onClick={handleCancel} size="icon" variant="ghost">
          <X className="h-4 w-4" />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={handleEdit}
      style={{ ...style }}
      className={`cursor-pointer w-full text-left px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm ${className}`}
    >
      {value}
    </div>
  );
}
