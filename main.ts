import { Result } from "./deps.ts";

export interface Failure {
  reason: string;
}

export type Parser<T> = (data: FormData) => Result.Result<Failure, T>;

export function required<T>(
  fieldName: string,
  fromString: (s: string) => Result.Result<Failure, T>,
): Parser<T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { reason: `required field '${fieldName}' ${err.reason}` };
      }, fromString(value));
    }
    return Result.Err({
      reason: `required field '${fieldName}' was empty`,
    });
  };
}

export function str(s: string): Result.Result<Failure, string> {
  return Result.Ok(s);
}

export function num(s: string): Result.Result<Failure, number> {
  if (s.length < 1) {
    return Result.Err({ reason: "was not a number" });
  }
  const i = Number(s);
  if (isNaN(i)) {
    return Result.Err({ reason: "was not a number" });
  }
  return Result.Ok(i);
}

export function numLessThan(
  limit: number,
): (s: string) => Result.Result<Failure, number> {
  return function (s: string) {
    return Result.andThen(
      (n: number) => {
        if (n >= limit) {
          return Result.Err({ reason: `must be less than ${limit}` });
        }
        return Result.Ok(n);
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
