import { nonEmpty, str } from "./mod.ts";
import { assertFails, assertSucceeds } from "./test_deps.ts";

Deno.test("strings", async function parseTest(t) {
  await t.step("str", () => {
    assertSucceeds("foo", str("foo"));
  });
  await t.step("nonEmpty", () => {
    assertSucceeds("foo", nonEmpty("foo"));
    assertFails("is empty", nonEmpty(""));
  });
});
