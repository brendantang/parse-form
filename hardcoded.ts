import { succeed, Validator } from "./validator.ts";

/**
 * `hardcoded` returns a `Validator` that ignores the given input and always succeeds with a default value.
 */
export function hardcoded<A, T>(defaultValue: T): Validator<A, T> {
  return function (_input: A) {
    return succeed(defaultValue);
  };
}
