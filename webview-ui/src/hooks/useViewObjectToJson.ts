import { JsonRecords } from "./useJsonToViewObject";

export function useViewObjectToJson(
  srcJsonObject: Record<string, any>,
  tableItems: JsonRecords,
  targetKey: string
) {
  let jsonObject: Record<string, any> = {};
  function createJsonObject() {
    const newJsonObject = { ...srcJsonObject };
    if (tableItems.type === "array") {
      newJsonObject[targetKey] = tableItems.record.map((item) => {
        const newItem: Record<string, any> = {};
        Object.keys(item).forEach((itemKey) => {
          newItem[itemKey] = item[itemKey].value;
        });
        return newItem;
      });
    } else if (tableItems.type === "object") {
      newJsonObject[targetKey] = tableItems.record.map((item) => {
        const newItem: Record<string, any> = {};
        Object.keys(item).forEach((itemKey) => {
          newItem[itemKey] = item[itemKey].value;
        });
        return newItem;
      })[0];
    } else {
      newJsonObject[targetKey] = tableItems.record.map((item) => {
        let newItem = null;
        Object.keys(item).forEach((itemKey) => {
          newItem = item[itemKey].value;
        });
        return newItem;
      })[0];
    }
    jsonObject = newJsonObject;
  }

  createJsonObject();

  return jsonObject;
}
