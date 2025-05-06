import { FC, useEffect, useState } from "react";
import styles from "./EditableTableRoot.module.scss";
import { JsonRecords, useJsonToViewObject } from "@/hooks/useJsonToViewObject";
import { EditableTable } from "./EditableTable";
import { useViewObjectToJson } from "@/hooks/useViewObjectToJson";

interface Props {
  jsonObject: Record<string, any>;
  setJsonObject: (jsonObject: Record<string, any>) => void;
}

export const EditableTableRoot: FC<Props> = ({ jsonObject, setJsonObject }) => {
  const [displayObjects, setDisplayObjects] = useState<Record<string, JsonRecords>>({});
  useEffect(() => {
    const dispObject = useJsonToViewObject(jsonObject);
    setDisplayObjects(dispObject);
  }, [jsonObject]);

  function setTableItems(tableItems: JsonRecords, key: string) {
    const newDisplayObjects = { ...displayObjects };
    newDisplayObjects[key] = tableItems;
    setDisplayObjects(newDisplayObjects);
    const newJsonObject = useViewObjectToJson(jsonObject, tableItems, key);
    setJsonObject(newJsonObject);
  }
  return (
    <>
      <div className={styles.root}>
        {Object.keys(displayObjects).map((key) => {
          return (
            <>
              <EditableTable
                tableTitle={key}
                tableItems={displayObjects[key]}
                setTableItems={(tableItems) => setTableItems(tableItems, key)}></EditableTable>
            </>
          );
        })}
      </div>
    </>
  );
};
