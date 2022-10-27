import {
  chain,
  lessThan,
  map,
  map2,
  num,
  optional,
  required,
  str,
  Validator,
} from "./mod.ts";
import { assertEquals, Result } from "./deps.ts";

const data = new FormData();
data.append("name", "Brendan");
data.append("age", "100");

Deno.test("parse", async function parseTest(t) {
  await t.step("one required field", async (t) => {
    interface NameOnly {
      name: string;
    }

    function constructor(name: string): NameOnly {
      return { name };
    }
    await t.step("data is present", () => {
      const validate: Validator<FormData, NameOnly> = map(
        constructor,
        required("name", str),
      );
      assertEquals(
        validate(data),
        Result.Ok({
          name: "Brendan",
        }),
      );
    });
    await t.step("data is not present", () => {
      const validate: Validator<FormData, NameOnly> = map(
        constructor,
        required("foo", str),
      );
      assertEquals(
        validate(data),
        Result.Err({
          reason: "field 'foo' was empty",
        }),
      );
    });
  });
  await t.step("two required fields", async (t) => {
    interface NameAndAge {
      name: string;
      age: number;
    }
    function constructor(name: string, age: number): NameAndAge {
      return { name, age };
    }

    await t.step("data is present", () => {
      const validate: Validator<FormData, NameAndAge> = map2(
        constructor,
        required("name", str),
        required("age", num),
      );
      assertEquals(
        validate(data),
        Result.Ok({
          name: "Brendan",
          age: 100,
        }),
      );
    });
    await t.step("name_ is not present", () => {
      const validate: Validator<FormData, NameAndAge> = map2(
        constructor,
        required("name_", str),
        required("age", num),
      );
      assertEquals(
        validate(data),
        Result.Err({
          reason: "field 'name_' was empty",
        }),
      );
    });
    await t.step("age_ is not present", () => {
      const validate: Validator<FormData, NameAndAge> = map2(
        constructor,
        required("name", str),
        required("age_", num),
      );
      assertEquals(
        validate(data),
        Result.Err({
          reason: "field 'age_' was empty",
        }),
      );
    });
    await t.step("name is not a number", () => {
      const validate: Validator<FormData, NameAndAge> = map2(
        constructor,
        required("age", str),
        required("name", num),
      );
      assertEquals(
        validate(data),
        Result.Err({
          reason: "field 'name' was not a number",
        }),
      );
    });
  });

  await t.step("validations", () => {
    interface AgeOnly {
      age: number;
    }
    const constructor = (age: number): AgeOnly => {
      return { age };
    };

    const validate: Validator<FormData, AgeOnly> = map(
      constructor,
      required("age", chain(num, lessThan(99))),
    );

    assertEquals(
      validate(data),
      Result.Err({
        reason: "field 'age' must be less than 99",
      }),
    );
  });

  await t.step("optional", () => {
    interface Username {
      username: string;
    }
    const constructor = (username: string): Username => {
      return { username };
    };
    const validate: Validator<FormData, Username> = map(
      constructor,
      optional("username", str, "anonymous"),
    );
    assertEquals(
      validate(data),
      Result.Ok({
        username: "anonymous",
      }),
    );
  });
});
