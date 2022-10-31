import { int, lessThan, num, wholeNumber } from "./mod.ts";
import { assertFails, assertSucceeds } from "./test_deps.ts";

Deno.test("numbers", async function (t) {
  await t.step("num", () => {
    assertSucceeds(1, num("1"));
    assertFails("is not a number", num("f"));
    assertSucceeds(-1.25, num("-1.25"));
  });
  await t.step("wholeNumber", () => {
    assertSucceeds(1, wholeNumber(1));
    assertSucceeds(-1, wholeNumber(-1));
    assertFails("is not a whole number", wholeNumber(1.1));
  });
  await t.step("int", () => {
    assertSucceeds(1, int("1"));
    assertSucceeds(-1, int("-1"));
    assertFails("is not a number", int("f"));
    assertFails("is not a whole number", int("1.25"));
  });
  await t.step("lessThan", () => {
    assertSucceeds(1, lessThan(2)(1));
    assertFails("must be less than 2", lessThan(2)(2));
  });
});
