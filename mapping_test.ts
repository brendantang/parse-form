import { chain, lessThan, map, map2, map3, map4, map5, num } from "./mod.ts";
import { assertFails, assertSucceeds } from "./test_deps.ts";

Deno.test("mapping", async function (t) {
  await t.step("map", () => {
    function increment(n: number): number {
      return n + 1;
    }
    assertSucceeds(2, map(increment, num)("1"));
    assertFails("is not a number", map(increment, num)("x"));
  });
  await t.step("map2", () => {
    function add(a: number, b: number): number {
      return a + b;
    }
    assertSucceeds(2, map2(add, num, num)("1"));
  });
  await t.step("map3", () => {
    function add(a: number, b: number, c: number): number {
      return a + b + c;
    }
    assertSucceeds(3, map3(add, num, num, num)("1"));
  });
  await t.step("map4", () => {
    function add(a: number, b: number, c: number, d: number): number {
      return a + b + c + d;
    }
    assertSucceeds(4, map4(add, num, num, num, num)("1"));
  });
  await t.step("map5", () => {
    function add(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
    ): number {
      return a + b + c + d + e;
    }
    assertSucceeds(5, map5(add, num, num, num, num, num)("1"));
  });
  await t.step("chain", () => {
    assertSucceeds(28, chain(num, lessThan(29))("28"));
    assertFails("must be less than 29", chain(num, lessThan(29))("30"));
    assertFails("is not a number", chain(num, lessThan(29))("foo"));
  });

  await t.step("andMap", () => {
    function add(a: number, b: number): number {
      
      return a + b;
    }
  });
});
