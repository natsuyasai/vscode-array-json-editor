export function useJsonToObject(jsonObject: Record<string, any>) {
  const objects: Record<string, Record<string, string>[]> = {};

  function createObjectFromJsonObject() {
    Object.keys(jsonObject).forEach((key) => {
      if (!objects[key]) {
        objects[key] = [];
      }
      const value = jsonObject[key];
      if (value === null) {
        return;
      }
      if (Array.isArray(value)) {
        // 配列要素の場合、各要素ごとにRecordを生成
        value.forEach((item: any) => {
          const arrayInnerObject: Record<string, string> = {};
          Object.keys(item).forEach((itemKey) => {
            arrayInnerObject[itemKey] = item[itemKey];
          });
          objects[key].push(arrayInnerObject);
        });
      } else if (typeof value === "object") {
        // 単なるオブジェクトならそのままRecordを生成
        const arrayInnerObject: Record<string, string> = {};
        Object.keys(value).forEach((itemKey) => {
          arrayInnerObject[itemKey] = value[itemKey];
        });
        objects[key].push(arrayInnerObject);
        return;
      } else {
        // valueが文字列や数値の場合、それ単一のRecordを生成
        const arrayInnerObject: Record<string, string> = {};
        arrayInnerObject[key] = value;
        objects[key].push(arrayInnerObject);
      }
    });
  }

  createObjectFromJsonObject();

  return objects;
}
