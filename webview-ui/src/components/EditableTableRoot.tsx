import { FC, useEffect, useState } from "react";
import styles from "./EditableTableRoot.module.scss";
import {
  VscodeTable,
  VscodeTableHeaderCell,
  VscodeTableHeader,
  VscodeTableBody,
  VscodeTableRow,
  VscodeTableCell,
  VscodeDivider,
} from "@vscode-elements/react-elements";
import { useJsonToObject } from "@/hooks/useJsonToObject";
import { EditableTable } from "./EditableTable";

interface Props {
  jsonObject: Record<string, any>;
  setJsonObject: (jsonObject: Record<string, any>) => void;
}

export const EditableTableRoot: FC<Props> = ({ jsonObject, setJsonObject }) => {
  const [objects, setObjects] = useState<Record<string, Record<string, string>[]>>({});
  useEffect(() => {
    const dispObject = useJsonToObject(jsonObject);
    console.log(dispObject);
    setObjects(dispObject);
  }, [jsonObject]);
  return (
    <>
      <div className={styles.root}>
        {Object.keys(objects).map((key) => {
          return (
            <>
              <EditableTable
                tableTitle={key}
                tableItems={objects[key]}
                setTableItems={() => {}}></EditableTable>
            </>
          );
        })}
      </div>
    </>
  );
};
