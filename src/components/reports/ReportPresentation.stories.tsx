import type { Story } from "@ladle/react";
import { ReportPresentation } from "./ReportPresentation";
import { useStudentData } from "../features/useStudentData";

export const Simple: Story = () => {
  const { provider } = useStudentData();
  return (
    <ReportPresentation
      dataProvider={provider}
      report={{
        name: "Simple Report",
        controls: [
          {
            type: "daterange",
            label: "Date Range",
            dataField: "date",
          },
          {
            type: "select",
            label: "Select subject",
            dataField: "subject",
          },
        ],
        widgets: [],
      }}
    />
  );
};
