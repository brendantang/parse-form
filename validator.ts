import { Result } from "./deps.ts";

/** A `Failure`  object contains a string describing why validation failed. */
export type Failure = {
  reason: string;
};

/** A `ValidationResult<T>` is either a validated value of type `Ok<T>`, or an explanation for why
validation failed (`Err<Failure>`) */
export type ValidationResult<T> = Result.Result<Failure, T>;

/** A `Validator<A,T>` is just a function that takes some value of type `A` and returns either:
  - an `Err<Failure>` describing why the value failed validation, or
  - an `Ok<T>` value wrapping the validated value of type `T`
*/
export type Validator<A, T> = (value: A) => ValidationResult<T>;

/** `fail` is a convenience function for use in `Validator` functions to describe why validation has failed. */
export function fail<T>(
  reason: string,
): ValidationResult<T> {
  return Result.Err({ reason });
}

/** `succeed` is a convenience function for use in `Validator` functions to return the validated value. */
export function succeed<T>(
  value: T,
): ValidationResult<T> {
  return Result.Ok(value);
}
