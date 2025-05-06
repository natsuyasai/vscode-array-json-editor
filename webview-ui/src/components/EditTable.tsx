import { FC, useEffect, useRef, useState } from "react";
import styles from "./EditTable.module.scss";
import {
  VscodeTable,
  VscodeTableHeaderCell,
  VscodeTableHeader,
  VscodeTableBody,
  VscodeTableRow,
  VscodeTableCell,
} from "@vscode-elements/react-elements";
import { useJsonToObject } from "@/hooks/useJsonToObject";

interface Props {
  jsonObject: Record<string, any>;
  setJsonObject: (jsonObject: Record<string, any>) => void;
}

export const EditTable: FC<Props> = ({ jsonObject, setJsonObject }) => {
  const [objects, setObjects] = useState<Record<string, Record<string, string>[]>>({});
  useEffect(() => {
    const dispObject = useJsonToObject(jsonObject);
    console.log(dispObject);
    setObjects(dispObject);
  }, [jsonObject]);
  return (
    <>
      {Object.keys(objects).map((key) => {
        return (
          <div key={key} className={styles.tableContainer}>
            <h3>{key}</h3>
            <VscodeTable zebra bordered-rows resizable>
              <VscodeTableHeader slot="header">
                {Object.keys(objects[key][0]).map((headerKey) => {
                  console.log(headerKey);
                  return <VscodeTableHeaderCell key={headerKey}>{headerKey}</VscodeTableHeaderCell>;
                })}
              </VscodeTableHeader>
              <VscodeTableBody slot="body">
                {objects[key].map((row, index) => (
                  <VscodeTableRow key={index}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <VscodeTableCell key={cellIndex}>{cell}</VscodeTableCell>
                    ))}
                  </VscodeTableRow>
                ))}
              </VscodeTableBody>
            </VscodeTable>
          </div>
        );
      })}
    </>
  );
};
