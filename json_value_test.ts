import { assertFails, assertSucceeds } from "./test_deps.ts";
import { chain, map2 } from "./mod.ts";
import { json, jsonNum, jsonStr, requireKey } from "./json_value.ts";

interface TestUser {
  name: string;
  age: number;
}

function TestUser(name: string, age: number): TestUser {
  return { name, age };
}

Deno.test("json tests", async (t) => {
  await t.step("json", () => {
    assertFails("is not valid json", json("foo"));
    assertSucceeds("foo", json('"foo"'));
    assertSucceeds(1, json("1"));
  });
  await t.step("jsonStr", () => {
    assertFails("is not a string", jsonStr(1));
    assertSucceeds("foo", jsonStr("foo"));
  });
  await t.step("jsonNum", () => {
    assertFails("is not a number", jsonNum("foo"));
    assertSucceeds(1, jsonNum(1));
  });
  await t.step("requireKey", () => {
    const expected: TestUser = { name: "Brendan", age: 100 };
    assertSucceeds(
      expected,
      chain(
        json,
        map2(TestUser, requireKey("name", jsonStr), requireKey("age", jsonNum)),
      )('{"name":"Brendan","age":100}'),
    );
  });
});
