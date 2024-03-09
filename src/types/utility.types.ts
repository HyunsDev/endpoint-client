export type NonEmptyString<T extends string> = T extends "" ? never : T;

export type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer R}`
    ? NonEmptyString<P> | ExtractParams<`${R}`>
    : T extends `${string}:${infer P}`
    ? P
    : never;

export type PathParamType = string | number;
