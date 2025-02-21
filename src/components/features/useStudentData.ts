import { DataProvider } from "@/types/report";
import { studentsData } from "./student-tests-result";
import { parse } from "date-fns";

const studentsColumns = [
  "studentId",
  "studentName",
  "date",
  "subject",
  "mark",
  "topic",
];

export function useStudentData(): { provider: DataProvider } {
  const students = studentsData
    .split("\n")
    .map((line) => {
      const [studentId, studentName, date, subject, mark, topic] =
        line.split(",");
      return {
        studentId,
        studentName,
        date: Math.floor(
          parse(date, "yyyy-MM-dd", new Date()).getTime() / 1000
        ),
        subject,
        mark: parseInt(mark),
        topic,
      };
    })
    .map((st) => [
      st.studentId,
      st.studentName,
      st.date,
      st.subject,
      st.mark,
      st.topic,
    ]);
  return {
    provider: {
      getUniqueValues: (input: {
        table: string;
        column: string;
      }): Promise<string[]> => {
        if (input.table === "students") {
          return Promise.resolve(
            students
              .map((st) => st[studentsColumns.indexOf(input.column)])
              .reduce((acc, curr) => {
                if (!acc.includes(curr as string)) {
                  acc.push(curr as string);
                }
                return acc;
              }, [] as string[])
          );
        }
        return Promise.resolve([]);
      },
      getTables: () =>
        Promise.resolve([
          {
            columns: [
              {
                dataField: "studentId",
                type: "string",
              },
              {
                dataField: "studentName",
                type: "string",
              },
              {
                dataField: "date",
                type: "date",
              },
              {
                dataField: "subject",
                type: "string",
              },
              {
                dataField: "mark",
                type: "number",
              },
              {
                dataField: "topic",
                type: "string",
              },
            ],
            name: "students",
          },
        ]),
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
      }) => {
        if (input.table === "students") {
          let result = students.filter((st) => {
            return input.filters.every((f) => {
              const value = st[studentsColumns.indexOf(f.column)];
              return f.type === "equals"
                ? value === f.value
                : value >= f.value[0] && value <= f.value[1];
            });
          });
          const stat = input.stats[0];
          const byKey: Record<
            string,
            {
              key: Record<string, string | number>;
              value: Record<string, number>;
              count: number;
            }
          > = {};
          result.forEach((st) => {
            const key = stat.groupBy
              .map((g) => {
                const r = st[studentsColumns.indexOf(g.column)];
                if (g.bucketSize) {
                  return Math.floor((r as number) / g.bucketSize);
                }
                return r;
              })
              .join("-");
            if (!byKey[key]) {
              byKey[key] = {
                key: stat.groupBy.reduce((acc, g) => {
                  acc[g.column] = st[studentsColumns.indexOf(g.column)];
                  if (g.bucketSize) {
                    acc[g.column] = Math.floor(
                      (acc[g.column] as number) / g.bucketSize
                    );
                  }
                  return acc;
                }, {} as Record<string, string | number>),
                count: 1,
                value: stat.fields.reduce((acc, f) => {
                  switch (f.aggregation) {
                    case "sum":
                      acc[f.name] = st[
                        studentsColumns.indexOf(f.column)
                      ] as number;
                      break;
                    case "count":
                      acc[f.name] = 1;
                      break;
                    case "avg":
                      acc[f.name] = st[
                        studentsColumns.indexOf(f.column)
                      ] as number;
                      break;
                    case "min":
                      acc[f.name] = st[
                        studentsColumns.indexOf(f.column)
                      ] as number;
                      break;
                    case "max":
                      acc[f.name] = st[
                        studentsColumns.indexOf(f.column)
                      ] as number;
                      break;
                  }
                  return acc;
                }, {} as Record<string, number>),
              };
            } else {
              stat.fields.forEach((f) => {
                switch (f.aggregation) {
                  case "sum":
                    byKey[key].value[f.name] =
                      byKey[key].value[f.name]! +
                      (st[studentsColumns.indexOf(f.column)] as number);
                    break;
                  case "count":
                    byKey[key].value[f.name]++;
                    break;
                  case "avg":
                    byKey[key].value[f.name] =
                      byKey[key].value[f.name]! +
                      (st[studentsColumns.indexOf(f.column)] as number);
                    break;
                  case "min":
                    byKey[key].value[f.name] = Math.min(
                      byKey[key].value[f.name]!,
                      st[studentsColumns.indexOf(f.column)] as number
                    );
                    break;
                  case "max":
                    byKey[key].value[f.name] = Math.max(
                      byKey[key].value[f.name]!,
                      st[studentsColumns.indexOf(f.column)] as number
                    );
                    break;
                }
                byKey[key].count++;
              });
            }
          });
          result = Object.values(byKey).map((r) => {
            stat.fields.forEach((f) => {
              if (f.aggregation === "avg") {
                r.value[f.name] = r.value[f.name]! / r.count;
              }
            });
            //return Object.values(r.key).concat(Object.values(r.value));
            return input.columns.map((c) => r.key[c] ?? r.value[c]);
          });
          result.sort((a, b) => {
            const s = input.sort[0];
            const isGreater =
              s.order === "asc"
                ? a[input.columns.indexOf(s.column)] <=
                  b[input.columns.indexOf(s.column)]
                : a[input.columns.indexOf(s.column)] >=
                  b[input.columns.indexOf(s.column)];
            return isGreater ? 1 : -1;
          });
          return Promise.resolve(result);
        }
        return Promise.resolve([]);
      },
    },
  };
}
