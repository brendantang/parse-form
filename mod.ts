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

/** `required` takes the name of a field and a validator for the string value at that field in the form.
 *  If there is no value provided, validation fails.
 */
export function required<T>(
  fieldName: string,
  fromString: Validator<string, T>,
): Validator<FormData, T> {
  return (data: FormData) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { reason: `field '${fieldName}' ${err.reason}` };
      }, fromString(value));
    }
    return Result.Err({
      reason: `field '${fieldName}' was empty`,
    });
  };
}

/** `optional` takes the name of a field, a validator for the string value at that field in the form, and a default value.
 *  The provided validator is used on the field value in the form, if any is provided. If no value is provided, validation
 *  succeeds with the provided default value.
 */
export function optional<T>(
  fieldName: string,
  fromString: Validator<string, T>,
  defaultValue: T,
): Validator<FormData, T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { reason: `field '${fieldName}' ${err.reason}` };
      }, fromString(value));
    }
    return Result.Ok(defaultValue);
  };
}

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

/** `str` is a `Validator` that indicates that the desired field value should be a string. */
export const str: Validator<string, string> = (s: string) => {
  return succeed(s);
};

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

/** A checked input element of type "checkbox" returns a string that says "ok".
 * `checkbox` is a validator that checks for a string equal to "ok". */
export const checkbox: Validator<string, boolean> = (s: string) => {
  return succeed(s === "ok");
};

/** `chain` takes two validator functions and combines them into one. */
export function chain<A, B, C>(
  validator1: Validator<A, B>,
  validator2: Validator<B, C>,
): Validator<A, C> {
  return function (a: A): ValidationResult<C> {
    const a_ = validator1(a);
    switch (a_.type) {
      case Result.ResultType.Err:
        return a_;
      case Result.ResultType.Ok:
        return validator2(a_.value);
    }
  };
}

/** `map` takes a function and a validator and returns a validator which, if successful, returns
 * the `Ok` value transformed by that function. */
export function map<A, B, T>(
  f: (b: B) => T,
  validator: (a: A) => ValidationResult<B>,
): (a: A) => ValidationResult<T> {
  return function (a: A): ValidationResult<T> {
    return Result.map(f, validator(a));
  };
}

/** `map2` takes a function and a two validators and returns a validator which, if all validators are successful, returns
 * the `Ok` value transformed by that function. */
export function map2<A, B, C, T>(
  f: (b: B, c: C) => T,
  validator: (a: A) => ValidationResult<B>,
  validator2: (a: A) => ValidationResult<C>,
): (a: A) => ValidationResult<T> {
  return function (a: A): ValidationResult<T> {
    return Result.map2(f, validator(a), validator2(a));
  };
}

export function map3<A, B, C, D, T>(
  f: (b: B, c: C, d: D) => T,
  validator: (a: A) => ValidationResult<B>,
  validator2: (a: A) => ValidationResult<C>,
  validator3: (a: A) => ValidationResult<D>,
): (a: A) => ValidationResult<T> {
  return function (a: A): ValidationResult<T> {
    return Result.map3(f, validator(a), validator2(a), validator3(a));
  };
}

export function map4<A, B, C, D, E, T>(
  f: (b: B, c: C, d: D) => T,
  validator: (a: A) => ValidationResult<B>,
  validator2: (a: A) => ValidationResult<C>,
  validator3: (a: A) => ValidationResult<D>,
  validator4: (a: A) => ValidationResult<E>,
): (a: A) => ValidationResult<T> {
  return function (a: A): ValidationResult<T> {
    return Result.map4(
      f,
      validator(a),
      validator2(a),
      validator3(a),
      validator4(a),
    );
  };
}

export function map5<A, B, C, D, E, F, T>(
  f: (b: B, c: C, d: D) => T,
  validator: (a: A) => ValidationResult<B>,
  validator2: (a: A) => ValidationResult<C>,
  validator3: (a: A) => ValidationResult<D>,
  validator4: (a: A) => ValidationResult<E>,
  validator5: (a: A) => ValidationResult<F>,
): (a: A) => ValidationResult<T> {
  return function (a: A): ValidationResult<T> {
    return Result.map5(
      f,
      validator(a),
      validator2(a),
      validator3(a),
      validator4(a),
      validator5(a),
    );
  };
}
