import { fail, succeed, Validator } from "./validator.ts";

/** `num` is a `Validator` that tries to convert the given string into a number. */
export const num: Validator<string, number> = (s: string) => {
  if (s.length < 1) {
    return fail("was not a number");
  }
  const i = Number(s);
  if (isNaN(i)) {
    return fail("was not a number");
  }
  return succeed(i);
};

/** `lessThan` takes a limit and returns a `Validator` that fails if the given number is greater than or equal to the limit. */
export function lessThan(limit: number): Validator<number, number> {
  return ((n: number) => {
    if (!(n < limit)) {
      return fail(`must be less than ${limit}`);
    }
    return succeed(n);
  });
}
