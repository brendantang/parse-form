import { fail, succeed, Validator } from "./validator.ts";

/** `str` is a `Validator` that indicates that the desired field value should be a string. */
export const str: Validator<string, string> = (s: string) => {
  return succeed(s);
};

/** `nonEmpty` is a `Validator` that ensures the given value is a non-empty string */
export const nonEmpty: Validator<string, string> = (s: string) => {
  if (s.length < 1) {
    return fail("is empty");
  }
  return succeed(s);
};
