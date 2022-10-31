import { ValidationResult, Validator } from "./validator.ts";
import { Result } from "./deps.ts";

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
  f: (b: B, c: C, d: D, e: E) => T,
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
  f: (b: B, c: C, d: D, e: E, f: F) => T,
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
