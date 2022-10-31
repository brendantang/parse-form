import {
  checkbox,
  map4,
  nullable,
  num,
  optional,
  required,
  str,
  Validator,
} from "./mod.ts";
import { assertFails, assertSucceeds } from "./test_deps.ts";

Deno.test("form data", async function (t) {
  interface User {
    name: string;
    age: number | null;
    newsletter: boolean;
    notifications: boolean;
  }

  function User(
    name: string,
    age: number | null,
    newsletter: boolean,
    notifications: boolean,
  ): User {
    return { name, age, newsletter, notifications };
  }

  const validate: Validator<FormData, User> = map4(
    User,
    required("name", str),
    nullable("age", num),
    required("newsletter", checkbox()),
    optional("notifications", checkbox("notifs"), false),
  );
  await t.step("success", () => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("age", "28");
    data.append("newsletter", "on");
    data.append("notifications", "notifs");

    assertSucceeds({
      name: "Brendan",
      age: 28,
      newsletter: true,
      notifications: true,
    }, validate(data));
  });
  await t.step("required fails", () => {
    const data = new FormData();

    assertFails("field 'name' is empty", validate(data));
  });
  await t.step("nullable", () => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("newsletter", "on");
    data.append("notifications", "notifs");

    assertSucceeds({
      name: "Brendan",
      age: null,
      newsletter: true,
      notifications: true,
    }, validate(data));
  });
  await t.step("checkbox", () => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("newsletter", "x");
    assertSucceeds({
      name: "Brendan",
      age: null,
      newsletter: false,
      notifications: false,
    }, validate(data));
  });
  await t.step("optional", () => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("newsletter", "on");
    assertSucceeds({
      name: "Brendan",
      age: null,
      newsletter: true,
      notifications: false,
    }, validate(data));
  });
});
