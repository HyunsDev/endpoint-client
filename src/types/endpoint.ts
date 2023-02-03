import { Method } from "./method";

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
