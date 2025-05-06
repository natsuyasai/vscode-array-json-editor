import { describe, expect } from "vitest";
import { useJsonToObject } from "@/hooks/useJsonToObject";

describe("Jsonオブジェクトから配列要素のkeyとvalueを抽出する", () => {
  it("配列が1つのみのJSONの場合、対象の配列の要素のRecodeが生成されること", () => {
    const objects = useJsonToObject({
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
    });
    expect(objects).toEqual({
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
    });
  });

  it("配列が2つ存在するJSONの場合、対象の配列の要素のRecodeが2つ分生成されること", () => {
    const objects = useJsonToObject({
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
      array2: [
        { key2_1: "value1_1", key2_2: "value1_2" },
        { key2_1: "value2_1", key2_2: "value2_2" },
        { key2_1: "value3_1", key2_2: "value3_2" },
      ],
    });
    expect(objects).toEqual({
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
      array2: [
        { key2_1: "value1_1", key2_2: "value1_2" },
        { key2_1: "value2_1", key2_2: "value2_2" },
        { key2_1: "value3_1", key2_2: "value3_2" },
      ],
    });
  });

  it("配列が2つ存在するかつ配列以外の要素も存在するJSONの場合、配列の要素のみ出力されること", () => {
    const objects = useJsonToObject({
      key1: "value1",
      key2: { key2_1: "value2_1", key2_2: "value2_2" },
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
      key3: "value3",
      array2: [
        { key2_1: "value1_1", key2_2: "value1_2" },
        { key2_1: "value2_1", key2_2: "value2_2" },
        { key2_1: "value3_1", key2_2: "value3_2" },
      ],
      key4: "value4",
    });
    expect(objects).toEqual({
      array1: [
        { key1_1: "value1_1", key1_2: "value1_2" },
        { key1_1: "value2_1", key1_2: "value2_2" },
        { key1_1: "value3_1", key1_2: "value3_2" },
      ],
      array2: [
        { key2_1: "value1_1", key2_2: "value1_2" },
        { key2_1: "value2_1", key2_2: "value2_2" },
        { key2_1: "value3_1", key2_2: "value3_2" },
      ],
      key1: [{ key1: "value1" }],
      key2: [{ key2_1: "value2_1", key2_2: "value2_2" }],
      key3: [{ key3: "value3" }],
      key4: [{ key4: "value4" }],
    });
  });
});

describe("TODO:ネストしたオブジェクト配列はどうするか？", () => {});
