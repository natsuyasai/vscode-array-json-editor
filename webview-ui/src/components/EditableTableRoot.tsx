import { FC, useEffect, useState } from "react";
import styles from "./EditableTableRoot.module.scss";
import { JsonRecords, useJsonToObject } from "@/hooks/useJsonToObject";
import { EditableTable } from "./EditableTable";

interface Props {
  jsonObject: Record<string, any>;
  setJsonObject: (jsonObject: Record<string, any>) => void;
}

export const EditableTableRoot: FC<Props> = ({ jsonObject, setJsonObject }) => {
  const [displayObjects, setDisplayObjects] = useState<Record<string, JsonRecords>>({});
  useEffect(() => {
    const dispObject = useJsonToObject(jsonObject);
    setDisplayObjects(dispObject);
  }, [jsonObject]);

  function setTableItems(tableItems: JsonRecords, key: string) {
    const newDisplayObjects = { ...displayObjects };
    newDisplayObjects[key] = tableItems;
    setDisplayObjects(newDisplayObjects);
    const newJsonObject = { ...jsonObject };
    newJsonObject[key] = tableItems.record.map((item) => {
      const newItem: Record<string, any> = {};
      Object.keys(item).forEach((itemKey) => {
        newItem[itemKey] = item[itemKey].value;
      });
      return newItem;
    });
    console.log(jsonObject);
    console.log(newJsonObject);
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
