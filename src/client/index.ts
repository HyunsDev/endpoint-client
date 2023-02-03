import axios, { Method } from "axios";
import {
    buildRequestError,
    isHTTPResponseError,
    isClientError,
    RequestTimeoutError,
} from "../error";
import { Endpoint } from "../types/endpoint";
import { pick } from "../utils/pick";

export interface ClientOptions {
    auth?: string;
    timeoutMs?: number;
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
}

type QueryParams = Record<string, any> | URLSearchParams;
type WithAuth<T> = T & { auth?: string };

export interface RequestParameters {
    path: string;
    method: Method;
    query?: QueryParams;
    body?: Record<string, unknown>;
    auth?: string;
    headers?: Record<string, string>;
}

export abstract class EndpointClient {
    private _auth?: string;
    private prefixUrl: string;
    private timeoutMs: number;
    private defaultHeaders: Record<string, string>;

    public constructor(options: ClientOptions) {
        this._auth = options?.auth;
        this.prefixUrl = options?.baseUrl;
        this.timeoutMs = options?.timeoutMs ?? 60_000;
        this.defaultHeaders = options?.defaultHeaders || {};
    }

    public updateAuth(auth?: string) {
        this._auth = auth;
    }

    private authAsHeaders(auth?: string): Record<string, string> {
        const headers: Record<string, string> = {};
        const authHeaderValue = auth ?? this._auth;
        if (authHeaderValue !== undefined) {
            headers["authorization"] = `Bearer ${authHeaderValue}`;
        }
        return headers;
    }

    public async request<ResponseBody>({
        path,
        method,
        query,
        body,
        auth,
        headers = {},
    }: RequestParameters): Promise<ResponseBody> {
        const url = `${this.prefixUrl}${path}`;
        const _headers: Record<string, string> = {
            ...this.authAsHeaders(auth),
            ...this.defaultHeaders,
            ...headers,
        };

        try {
            const response = await RequestTimeoutError.rejectAfterTimeout(
                axios(url, {
                    method: method.toUpperCase(),
                    headers: _headers,
                    data: body,
                    params: query,
                }),
                this.timeoutMs
            );

            return response.data;
        } catch (error: any) {
            if (error?.response) {
                throw buildRequestError(error.response);
            }
            if (!isClientError(error)) throw error;
            if (isHTTPResponseError(error)) throw error;
            throw error;
        }
    }

    protected endpointBuilder<
        Parameter extends Record<string, any>,
        Response extends Record<string, any>
    >(endpoint: Endpoint<Parameter, Response>) {
        return (args: WithAuth<Parameter>): Promise<Response> => {
            const path =
                typeof endpoint.path === "string"
                    ? endpoint.path
                    : endpoint.path(args);

            return this.request<Response>({
                path,
                method: endpoint.method,
                query: pick(args, endpoint.queryParams || ([] as any)),
                body: pick(args, endpoint.bodyParams || ([] as any)),
                auth: args?.auth,
                headers: endpoint.headers,
            });
        };
    }
}
