import { Result } from "./deps.ts";

/** A `Failure` object is returned as the Err branch when parsing fails. */
export interface Failure {
  fieldName: string;
  reason: FailureReason;
}

/** A `FailureReason` is just a string describing why validation failed. */
export type FailureReason = string;

/** A `ValidationResult<T>` is either a validated value of type `Ok<T>`, or an explanation for why
validation failed (`Err<FailureReason>`) */
export type ValidationResult<T> = Result.Result<FailureReason, T>;

/** A `Parser<T>` is a function which takes a `FormData` object and either parses it into a valid object of type `Ok<T>`,
 or provides the first field that failed validation, along with a string describing why validation failed (`Err<Failure>`) */
export type Parser<T> = (data: FormData) => Result.Result<Failure, T>;

/** A `Validator<A,T>` is just a function that takes some value of type `A` and returns either:
  - an `Err<FailureReason>` describing why the value failed validation, or
  - an `Ok<T>` value wrapping the validated value of type `T`
*/
export type Validator<A, T> = (value: A) => ValidationResult<T>;

/** `required` takes the name of a field and a validator for the string value at that field in the form.
 *  If there is no value provided, validation fails. Otherwise, the provided validator is used on the field value.
 */
export function required<T>(
  fieldName: string,
  fromString: Validator<string, T>,
): Parser<T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { fieldName: fieldName, reason: err };
      }, fromString(value));
    }
    return Result.Err({
      fieldName: fieldName,
      reason: `was empty`,
    });
  };
}

/** `required` takes the name of a field, a validator for the string value at that field in the form, and a default value.
 *  The provided validator is used on the field value in the form, if any is provided. If no value is provided, validation
 *  succeeds with the provided default value.
 */
export function optional<T>(
  fieldName: string,
  fromString: Validator<string, T>,
  defaultValue: T,
): Parser<T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { fieldName: fieldName, reason: err };
      }, fromString(value));
    }
    return Result.Ok(defaultValue);
  };
}

/** `fail` is a convenience function for use in `Validator` functions to describe why validation has failed. */
export function fail<T>(
  reason: FailureReason,
): ValidationResult<T> {
  return Result.Err(reason);
}

/** `succeed` is a convenience function for use in `Validator` functions to return the validated value. */
export function succeed<T>(
  value: T,
): ValidationResult<T> {
  return Result.Ok(value);
}

/** `str` is a `Validator` that indicates that the desired field value should be a string. */
export const str: Validator<string, string> = (s: string) => {
  return succeed(s);
};

/** `num` is a `Validator` that indicates that the desired field value should be a number. */
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

export function numLessThan(
  limit: number,
): (s: string) => FieldResult<number> {
  return function (s: string) {
    return Result.andThen(
      (n: number) => {
        if (n >= limit) {
          return fail(`must be less than ${limit}`);
        }
        return succeed(n);
      },
      num(s),
    );
  };
}

export function parse<T>(
  parser: Parser<T>,
  data: FormData,
): Result.Result<Failure, T> {
  return parser(data);
}

export function map<A, T>(
  constructor: (a: A) => T,
  parser: Parser<A>,
): Parser<T> {
  return function (data) {
    const parsedA = parser(data);
    switch (parsedA.type) {
      case Result.ResultType.Err:
        return parsedA;
      case Result.ResultType.Ok:
        return Result.Ok(constructor(parsedA.value));
    }
  };
}

export function map2<A, B, T>(
  constructor: (a: A, b: B) => T,
  parserA: Parser<A>,
  parserB: Parser<B>,
): Parser<T> {
  return function (data) {
    const parsedA = parserA(data);
    switch (parsedA.type) {
      case Result.ResultType.Err:
        return parsedA;
      case Result.ResultType.Ok: {
        const parsedB = parserB(data);
        switch (parsedB.type) {
          case Result.ResultType.Err:
            return parsedB;
          case Result.ResultType.Ok:
            return Result.Ok(constructor(parsedA.value, parsedB.value));
        }
      }
    }
  };
}

export function chain<A, B>(
  parserA: Parser<A>,
  f: (a: A) => Result.Result<Failure, B>,
): Parser<B> {
  return function (data: FormData): Result.Result<Failure, B> {
    const a = parserA(data);
    switch (a.type) {
      case Result.ResultType.Err:
        return a;
      case Result.ResultType.Ok:
        return f(a.value);
    }
  };
}
