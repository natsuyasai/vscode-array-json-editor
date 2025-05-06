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
    // TODO 逆変換を別関数に切り出してテスト作成
    if (tableItems.type === "array") {
      newJsonObject[key] = tableItems.record.map((item) => {
        const newItem: Record<string, any> = {};
        Object.keys(item).forEach((itemKey) => {
          newItem[itemKey] = item[itemKey].value;
        });
        return newItem;
      });
    } else if (tableItems.type === "object") {
      newJsonObject[key] = tableItems.record.map((item) => {
        const newItem: Record<string, any> = {};
        Object.keys(item).forEach((itemKey) => {
          newItem[itemKey] = item[itemKey].value;
        });
        return newItem;
      })[0];
    } else {
      newJsonObject[key] = tableItems.record.map((item) => {
        let newItem = null;
        Object.keys(item).forEach((itemKey) => {
          newItem = item[itemKey].value;
        });
        return newItem;
      })[0];
    }
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
