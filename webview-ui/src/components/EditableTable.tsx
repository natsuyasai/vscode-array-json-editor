import { FC, useEffect, useState } from "react";
import styles from "./EditableTable.module.scss";
import {
  VscodeTable,
  VscodeTableHeaderCell,
  VscodeTableHeader,
  VscodeTableBody,
  VscodeTableRow,
  VscodeTableCell,
} from "@vscode-elements/react-elements";

interface Props {
  tableTitle: string;
  tableItems: Record<string, any>[];
  setTableItems: (jsonObject: Record<string, any>) => void;
}

export const EditableTable: FC<Props> = ({ tableTitle, tableItems, setTableItems }) => {
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
              {tableItems.map((row, index) => (
                <VscodeTableRow key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <VscodeTableCell key={cellIndex} className={styles.cell}>
                      {cell}
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
