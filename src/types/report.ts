export type Report = {
  name: string;
  controls: (
    | {
        type: "select";
        label: string;
        dataField: string;
        options?: {
          label: string;
          value: string;
        }[];
      }
    | {
        type: "daterange";
        label: string;
        dataField: string;
      }
  )[];
  widgets: (
    | {
        type: "table";
        columns: {
          label: string;
          dataFields: string[];
          function?: string;
        }[];
      }
    | {
        type: "timeseries_linechart";
        xAxisField: string;
        yAxisField: string;
        bucketSizeInSeconts: number;
        aggregation: "sum" | "count" | "avg" | "min" | "max";
      }
  )[];
};

export type DataItem = (number | string)[];

export type DataTableDefinition = {
  columns: {
    dataField: string;
    type: "number" | "string" | "boolean" | "date";
    numberUnit?: string;
  }[];
  name: string;
};

export type DataProvider = {
  getTables: () => Promise<DataTableDefinition[]>;
  getUniqueValues: (input: {
    table: string;
    column: string;
  }) => Promise<string[]>;
  getData: (input: {
    table: string;
    columns: string[];
    filters: {
      column: string;
      type: "range" | "equals";
      value: number[] | string;
    }[];
    sort: {
      column: string;
      order: "asc" | "desc";
    }[];
    stats: {
      fields: {
        column: string;
        name: string;
        aggregation: "sum" | "count" | "avg" | "min" | "max";
      }[];
      groupBy: {
        column: string;
        bucketSize?: number;
      }[];
    }[];
  }) => Promise<DataItem[]>;
};
