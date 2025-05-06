import { FC, useEffect, useState } from "react";
import styles from "./EditableTable.module.scss";
import {
  VscodeTable,
  VscodeTableHeaderCell,
  VscodeTableHeader,
  VscodeTableBody,
  VscodeTableRow,
  VscodeTableCell,
  VscodeTextarea,
} from "@vscode-elements/react-elements";

interface Props {
  tableTitle: string;
  tableItems: Record<string, any>[];
  setTableItems: (jsonObject: Record<string, any>[]) => void;
}

export const EditableTable: FC<Props> = ({ tableTitle, tableItems, setTableItems }) => {
  function handleInput(event: Event) {
    console.log(event);
  }
  function handleUpdated(event: Event, rowIndex: number, cellIndex: number) {
    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;
    const updatedTableItems = [...tableItems];
    updatedTableItems[rowIndex][cellIndex] = newValue;
    setTableItems(updatedTableItems);
  }

  return (
    <>
      <div key={tableTitle}>
        <h2 className={styles.title}>{tableTitle}</h2>
        <div className={styles.tableRoot}>
          <VscodeTable zebra bordered-rows resizable>
            <VscodeTableHeader slot="header">
              {Object.keys(tableItems[0]).map((headerKey) => {
                return (
                  <VscodeTableHeaderCell key={headerKey} className={styles.cell}>
                    {headerKey}
                  </VscodeTableHeaderCell>
                );
              })}
            </VscodeTableHeader>
            <VscodeTableBody slot="body">
              {tableItems.map((row, rowIndex) => (
                <VscodeTableRow key={rowIndex}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <VscodeTableCell key={cellIndex} className={styles.cell}>
                      <VscodeTextarea
                        className={styles.textArea}
                        resize="both"
                        value={cell}
                        onInput={handleInput}
                        onChange={(e) => {
                          handleUpdated(e, rowIndex, cellIndex);
                        }}></VscodeTextarea>
                    </VscodeTableCell>
                  ))}
                </VscodeTableRow>
              ))}
            </VscodeTableBody>
          </VscodeTable>
        </div>
      </div>
    </>
  );
};
