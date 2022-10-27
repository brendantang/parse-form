import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  map,
  map2,
  num,
  numLessThan,
  optional,
  parse,
  Parser,
  required,
  str,
} from "./mod.ts";
import { Result } from "./deps.ts";

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
      const parser: Parser<NameOnly> = map(constructor, required("name", str));
      assertEquals(
        parse<NameOnly>(parser, data),
        Result.Ok({
          name: "Brendan",
        }),
      );
    });
    await t.step("data is not present", () => {
      const parser: Parser<NameOnly> = map(constructor, required("foo", str));
      assertEquals(
        parse<NameOnly>(parser, data),
        Result.Err({
          fieldName: "foo",
          reason: "was empty",
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
      const parser: Parser<NameAndAge> = map2(
        constructor,
        required("name", str),
        required("age", num),
      );
      assertEquals(
        parse<NameAndAge>(parser, data),
        Result.Ok({
          name: "Brendan",
          age: 100,
        }),
      );
    });
    await t.step("name_ is not present", () => {
      const parser: Parser<NameAndAge> = map2(
        constructor,
        required("name_", str),
        required("age", num),
      );
      assertEquals(
        parse<NameAndAge>(parser, data),
        Result.Err({
          fieldName: "name_",
          reason: "was empty",
        }),
      );
    });
    await t.step("age_ is not present", () => {
      const parser: Parser<NameAndAge> = map2(
        constructor,
        required("name", str),
        required("age_", num),
      );
      assertEquals(
        parse<NameAndAge>(parser, data),
        Result.Err({
          fieldName: "age_",
          reason: "was empty",
        }),
      );
    });
    await t.step("name is not a number", () => {
      const parser: Parser<NameAndAge> = map2(
        constructor,
        required("age", str),
        required("name", num),
      );
      assertEquals(
        parse<NameAndAge>(parser, data),
        Result.Err({
          fieldName: "name",
          reason: "was not a number",
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

    const parser: Parser<AgeOnly> = map(
      constructor,
      required("age", numLessThan(99)),
    );

    assertEquals(
      parse<AgeOnly>(parser, data),
      Result.Err({
        fieldName: "age",
        reason: "must be less than 99",
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
    const parser: Parser<Username> = map(
      constructor,
      optional("username", str, "anonymous"),
    );
    assertEquals(
      parse<Username>(parser, data),
      Result.Ok({
        username: "anonymous",
      }),
    );
  });
});
