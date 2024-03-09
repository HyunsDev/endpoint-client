import { Method } from "./method";
import { ExtractParams, PathParamType } from "./utility.types";

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
 * Forces the path parameter defined in path string to be specified.
 *
 * @example
 * type Path = "/user/:id";
 * type Endpoint = __Experimental__Endpoint<"GET", "/user/:id">;
 * const endpoint: Endpoint = {
 *   method: "GET",
 *   path: "/user/:id",
 *   pathParams: {}
 * // ^^^^^^^^^ Error: Property 'id' is missing in type '{}' but required in type 'Record<"id", PathParamType>'.
 * }
 */
export type __Experimental__Endpoint<M extends Method, P extends string> = {
  method: M;
  path: P;
  pathParams: ExtractParams<P> extends never
    ? never
    : Record<ExtractParams<P>, PathParamType>;
};
