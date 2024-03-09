import { __Experimental__Endpoint } from "../types";
import { ExtractParams } from "../types/utility.types";

function extractParams<P extends string>(path: P): ExtractParams<P>[] {
  return (path.match(/:[a-zA-Z0-9]+/g)?.map((key) => key.slice(1)) ??
    []) as ExtractParams<P>[];
}

function get<P extends string>({
  path,
  queryParams,
  pathParams,
}: Omit<__Experimental__Endpoint<"GET", P>, "method">) {
  const queryStr = new URLSearchParams(queryParams).toString();
  let pathStr: string = path;

  const params = extractParams(path);
  params.forEach((param) => {
    const value = pathParams[param];
    if (value === undefined) {
      throw new Error(`Path parameter ${param} is not provided`);
    }

    pathStr = pathStr.replace(`:${param}`, value.toString());
  });

  return pathStr + (queryStr ? `?${queryStr}` : "");
}
