import { fail, succeed, ValidationResult, Validator } from "./validator.ts";
import { chain } from "./mapping.ts";

/** `num` is a `Validator` that tries to convert the given string into a number. */
export const num: Validator<string, number> = (s: string) => {
  const failure: ValidationResult<number> = fail("is not a number");
  if (s.length < 1) {
    return failure;
  }
  const i = Number(s);
  if (isNaN(i)) {
    return failure;
  }
  return succeed(i);
};

/** `wholeNumber` is a `Validator` that fails if the given number is not an integer. */
export const wholeNumber: Validator<number, number> = (n: number) => {
  if (Number.isInteger(n)) {
    return succeed(n);
  }
  return fail("is not a whole number");
};

/** `int` is a `Validator` that tries to convert the given string into a whole number. */
export const int: Validator<string, number> = chain(num, wholeNumber);

/** `lessThan` takes a limit and returns a `Validator` that fails if the given number is greater than or equal to the limit. */
export function lessThan(limit: number): Validator<number, number> {
  return ((n: number) => {
    if (!(n < limit)) {
      return fail(`must be less than ${limit}`);
    }
    return succeed(n);
  });
}
