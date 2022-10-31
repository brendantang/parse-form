import {
  chain,
  checkbox,
  fail,
  int,
  lessThan,
  map,
  map2,
  map3,
  map4,
  map5,
  nonEmpty,
  num,
  optional,
  required,
  str,
  succeed,
  ValidationResult,
  Validator,
} from "./mod.ts";
import { assertEquals, Result } from "./deps.ts";

function assertSucceeds<T>(value: T, testCase: ValidationResult<T>) {
  assertEquals(Result.Ok(value), testCase);
}

function assertFails<T>(
  reason: string,
  testCase: ValidationResult<T>,
) {
  assertEquals(Result.Err({ reason }), testCase);
}

Deno.test("validators", async function parseTest(t) {
  await t.step("strings", async (t) => {
    await t.step("str", () => {
      assertSucceeds("foo", str("foo"));
    });
    await t.step("nonEmpty", () => {
      assertSucceeds("foo", nonEmpty("foo"));
      assertFails("is empty", nonEmpty(""));
    });
  });

  await t.step("numbers", async (t) => {
    await t.step("num", () => {
      assertSucceeds(1, num("1"));
      assertFails("is not a number", num("f"));
      assertSucceeds(-1.25, num("-1.25"));
    });
    await t.step("int", () => {
      assertSucceeds(1, int("1"));
      assertSucceeds(-1, int("-1"));
      assertFails("is not a number", int("f"));
      assertFails("is not a whole number", int("1.25"));
    });
  });

  await t.step("form data", async (t) => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("age", "100");
    interface NameOnly {
      name: string;
    }
    function NameOnly(name: string): NameOnly {
      return { name };
    }

    await t.step("required", () => {
      const validateName: Validator<FormData, NameOnly> = map(
        NameOnly,
        required("name", str),
      );
      assertSucceeds({ name: "Brendan" }, validateName(data));
      const validateFoo: Validator<FormData, NameOnly> = map(
        NameOnly,
        required("foo", str),
      );
      assertFails(
        "field 'foo' is empty",
        validateFoo(data),
      );
    });

    await t.step("optional", async (t) => {
      await t.step("data is present", () => {
        const validate: Validator<FormData, NameOnly> = map(
          NameOnly,
          optional("name", str, "anonymous"),
        );
        assertSucceeds(
          {
            name: "Brendan",
          },
          validate(data),
        );
      });
      await t.step("data is not present", () => {
        const validate: Validator<FormData, NameOnly> = map(
          NameOnly,
          optional("wrongFieldName", str, "anonymous"),
        );
        assertSucceeds(
          { name: "anonymous" },
          validate(data),
        );
      });
    });
  });

  await t.step("custom", () => {
    const isBrendan: Validator<string, string> = (s: string) => {
      if (s !== "Brendan") {
        return fail("is not equal to 'Brendan'");
      }
      return succeed(s);
    };
    assertSucceeds("Brendan", isBrendan("Brendan"));
    assertFails("is not equal to 'Brendan'", isBrendan("Jacob"));
  });

  await t.step("chain", () => {
    assertSucceeds(28, chain(num, lessThan(29))("28"));
    assertFails("must be less than 29", chain(num, lessThan(29))("30"));
    assertFails("is not a number", chain(num, lessThan(29))("foo"));
  });
  await t.step("mapping", async (t) => {
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
  });
});
