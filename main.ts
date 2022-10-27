import { Result } from "./deps.ts";

export interface Failure {
  fieldName: string;
  reason: string;
}
type FailureReason = string;
type FieldResult<T> = Result.Result<FailureReason, T>;

export type Parser<T> = (data: FormData) => Result.Result<Failure, T>;

export function required<T>(
  fieldName: string,
  fromString: (s: string) => FieldResult<T>,
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

export function fail<T>(
  reason: FailureReason,
): FieldResult<T> {
  return Result.Err(reason);
}

export function succeed<T>(
  value: T,
): FieldResult<T> {
  return Result.Ok(value);
}

export function str(s: string): FieldResult<string> {
  return succeed(s);
}

export function num(s: string): FieldResult<number> {
  if (s.length < 1) {
    return fail("was not a number");
  }
  const i = Number(s);
  if (isNaN(i)) {
    return fail("was not a number");
  }
  return succeed(i);
}

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
