import { checkbox, map3, optional, required, str, Validator } from "./mod.ts";
import { assertEquals, Result } from "./deps.ts";

interface ContactFormData {
  name: string;
  email: string;
  newsletter: boolean;
}

function contactFormDataConstructor(
  name: string,
  email: string,
  newsletter: boolean,
): ContactFormData {
  return { name, email, newsletter };
}

const parseForm: Validator<FormData, ContactFormData> = map3(
  contactFormDataConstructor,
  optional("name", str, ""),
  required("email", str),
  optional("newsletter", checkbox, false),
);

Deno.test("map tests", async (t) => {
  await t.step("all data present", () => {
    const data = new FormData();
    data.append("name", "Brendan");
    data.append("pronouns", "he/him");
    data.append("email", "brendan@example.com");
    data.append("newsletter", "ok");
    data.append("message", "I love your work!");

    assertEquals(
      parseForm(data),
      Result.Ok({
        name: "Brendan",
        email: "brendan@example.com",
        newsletter: true,
      }),
    );
  });
});
