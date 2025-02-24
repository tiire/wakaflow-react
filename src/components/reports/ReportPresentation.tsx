import { Report, DataProvider } from "../../types/report";
import { Button } from "../ui/button";
import DateRangePicker from "../ui/date-range-picker";
import { Label } from "../ui/label";
import "../../styles/global.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";

function FilterSelect({ getter }: { getter: () => Promise<string[]> }) {
  const [data, setData] = useState<string[] | undefined>();

  useEffect(() => {
    getter().then(setData);
  }, [getter]);

  if (!data) {
    return null;
  }
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ReportPresentation({
  report,
}: {
  report: Report;
  dataProvider: DataProvider;
}) {
  const [data, setData] = useState<{
    uniqueValues: Record<string, { key: string; table: string; value: string }>;
  }>({ uniqueValues: {} });

  return (
    <div className="flex flex-col gap-4">
      <Button>{report.name}</Button>
      {report.controls.map((cont) => {
        switch (cont.type) {
          case "daterange":
            return (
              <div className="flex items-center space-x-2">
                <DateRangePicker key={cont.label} id={cont.label} />
                <Label htmlFor={cont.label}>{cont.label}</Label>
              </div>
            );
          case "select":
            return (
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
