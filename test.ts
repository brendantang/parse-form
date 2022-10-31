import {
  chain,
  lessThan,
  map,
  map2,
  nonEmpty,
  num,
  optional,
  required,
  str,
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
      assertFails("", nonEmpty(""));
    });
  });

  await t.step("numbers", async (t) => {
    await t.step("num", () => {
      assertSucceeds(1, num("1"));
      assertFails("is not a number", num("f"));
      assertSucceeds(-1.25, num("-1.25"));
    });
    await t.step("int", () => {
      assertSucceeds(1, num("1"));
      assertSucceeds(-1, num("-1"));
      assertFails("is not a number", num("f"));
      assertFails("is not a whole number", num("1.25"));
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
});
