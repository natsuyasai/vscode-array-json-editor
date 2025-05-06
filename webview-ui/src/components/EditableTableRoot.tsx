import { FC, useEffect, useState } from "react";
import styles from "./EditableTableRoot.module.scss";
import { useJsonToObject } from "@/hooks/useJsonToObject";
import { EditableTable } from "./EditableTable";

interface Props {
  jsonObject: Record<string, any>;
  setJsonObject: (jsonObject: Record<string, any>) => void;
}

export const EditableTableRoot: FC<Props> = ({ jsonObject, setJsonObject }) => {
  const [displayObjects, setDisplayObjects] = useState<Record<string, Record<string, string>[]>>(
    {}
  );
  useEffect(() => {
    const dispObject = useJsonToObject(jsonObject);
    setDisplayObjects(dispObject);
  }, [jsonObject]);

  function setTableItems(tableItems: Record<string, any>[], key: string) {
    const newObjects = { ...displayObjects };
    newObjects[key] = tableItems;
    setDisplayObjects(newObjects);
    const newJsonObject = { ...jsonObject };
    newJsonObject[key] = tableItems;
    console.log("oldJsonObject", jsonObject);
    console.log("newJsonObject", newJsonObject);
    // setJsonObject(newJsonObject);
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
