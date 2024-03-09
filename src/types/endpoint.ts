import { Method } from "./method";
import { ExtractParams, HasBodyMethod, PathParamType } from "./utility.types";

type value = any;

export type Endpoint<
  Parameter extends Record<string, value> | string,
  Response extends Record<string, value> | string
> = {
  method: Method;
  path: string | ((e: Parameter) => string);
  pathParams?: (keyof Parameter)[];
  queryParams?: (keyof Parameter)[];
  bodyParams?: (keyof Parameter)[];
  headers?: Record<string, string>;
};

/**
 * `bodyParams` should be specified if the method is one of the following:
 * - POST
 * - PUT
 * - PATCH
 * - DELETE
 *
 * `pathParams` should be specified as a record type with the keys from the P string
 *
 * @example
 * type E1 = __Experimental__Endpoint<"GET", "/todos/:id">;
 * const endpoint: E1 = {
 *   method: "GET",
 *   path: "/todos/:id",
 *   pathParams: {}
 *   // ^^^^^^^ Error: Property 'id' is missing in type '{}' but required in type 'Record<"id", PathParamType>'.
 * }
 *
 * type E2 = __Experimental__Endpoint<"GET", "/todos">;
 * const endpoint: E2 = {
 *   method: "GET",
 *   path: "/todos",
 *   pathParams: {},
 *   // ^^^^^^^ Error: Type '{}' is not assignable to type 'never'.
 *   bodyParams: {},
 *   // ^^^^^^^ Error: Type '{}' is not assignable to type 'never'.
 * };
 */
export type __Experimental__Endpoint<M extends Method, P extends string> = {
  method: M;
  path: P;
  queryParams: Record<string, any>;
  pathParams: ExtractParams<P> extends never
    ? never
    : Record<ExtractParams<P>, PathParamType>;
  bodyParams: M extends HasBodyMethod ? Record<string, any> : never;
};
