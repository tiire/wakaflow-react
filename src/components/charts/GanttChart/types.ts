
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
