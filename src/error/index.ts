import { AxiosResponse, AxiosResponseHeaders } from "axios";
import { APIErrorCode, ClientErrorCode, ErrorCode } from "./errorCode";
import { isObject } from "../utils/isObject";

abstract class ClientErrorBase<Code extends ErrorCode> extends Error {
    abstract code: Code;
}

export type ClientError = RequestTimeoutError;

export function isClientError(error: unknown): error is ClientError {
    return isObject(error) && error instanceof ClientErrorBase;
}

function isClientErrorWithCode<Code extends ErrorCode>(
    error: unknown,
    codes: { [C in Code]: true }
): error is ClientError & { code: Code } {
    return isClientError(error) && error.code in codes;
}

export class RequestTimeoutError extends ClientErrorBase<ClientErrorCode.RequestTimeout> {
    readonly code = ClientErrorCode.RequestTimeout;
    readonly name = "RequestTimeoutError";

    constructor(message = "Request to Hyuns API has time out") {
        super(message);
    }

    static isRequestTimeoutError(error: unknown): error is RequestTimeoutError {
        return isClientErrorWithCode(error, {
            [ClientErrorCode.RequestTimeout]: true,
        });
    }

    static rejectAfterTimeout<T>(
        promise: Promise<T>,
        timeoutMS: number
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new RequestTimeoutError());
            }, timeoutMS);

            promise
                .then(resolve)
                .catch(reject)
                .then(() => clearTimeout(timeoutId));
        });
    }
}

type HTTPResponseErrorCode = ClientErrorCode.ResponseError | APIErrorCode;

class HTTPResponseError<
    Code extends HTTPResponseErrorCode
> extends ClientErrorBase<Code> {
    readonly name: string = "HTTPResponseError";
    readonly code: Code;
    readonly status: number;
    readonly headers: AxiosResponseHeaders;
    readonly body: Record<string, any>;

    constructor(args: {
        code: Code;
        status: number;
        message: string;
        headers: AxiosResponseHeaders;
        body: Record<string, any>;
    }) {
        super(args.message);
        const { code, status, headers, body } = args;
        this.code = code;
        this.status = status;
        this.headers = headers;
        this.body = body;
    }
}

const httpResponseErrorCodes: { [C in HTTPResponseErrorCode]: true } = {
    [ClientErrorCode.ResponseError]: true,
    [APIErrorCode.Unauthorized]: true,
    [APIErrorCode.RateLimited]: true,
    [APIErrorCode.InvalidRequestURL]: true,
    [APIErrorCode.InvalidRequest]: true,
    [APIErrorCode.ValidationError]: true,
    [APIErrorCode.InternalServerError]: true,
    [APIErrorCode.ServiceUnavailable]: true,
};

export function isHTTPResponseError(
    error: unknown
): error is UnknownHTTPResponseError | APIResponseError {
    return isClientErrorWithCode(error, httpResponseErrorCodes);
}

export class UnknownHTTPResponseError extends HTTPResponseError<ClientErrorCode.ResponseError> {
    readonly name = "UnknownHTTPResponseError";

    constructor(args: {
        status: number;
        message: string | undefined;
        headers: AxiosResponseHeaders;
        body: Record<string, any>;
    }) {
        super({
            body: args.body,
            headers: args.headers,
            status: args.status,
            code: ClientErrorCode.ResponseError,
            message:
                args.message ??
                `Request to Hyuns API failed with status: ${args.status}`,
        });
    }

    static isUnknownHTTPResponseError(
        error: unknown
    ): error is UnknownHTTPResponseError {
        return isClientErrorWithCode(error, {
            [ClientErrorCode.ResponseError]: true,
        });
    }
}

const APIErrorCodes: { [C in APIErrorCode]: true } = {
    [APIErrorCode.Unauthorized]: true,
    [APIErrorCode.RateLimited]: true,
    [APIErrorCode.InvalidRequestURL]: true,
    [APIErrorCode.InvalidRequest]: true,
    [APIErrorCode.ValidationError]: true,
    [APIErrorCode.InternalServerError]: true,
    [APIErrorCode.ServiceUnavailable]: true,
};

// API의 status가 400 이상일 때 해당 에러를 반환합니다.
export class APIResponseError extends HTTPResponseError<APIErrorCode> {
    readonly name = "APIResponseError";

    static isAPIResponseError(error: unknown): error is APIResponseError {
        return isClientErrorWithCode(error, APIErrorCodes);
    }
}

export function buildRequestError(
    response: AxiosResponse
): APIResponseError | UnknownHTTPResponseError {
    const apiErrorResponseBody = response.data;
    if (apiErrorResponseBody !== undefined) {
        return new APIResponseError({
            code: apiErrorResponseBody.code,
            message: apiErrorResponseBody.message,
            headers: response.headers,
            status: response.status,
            body: apiErrorResponseBody,
        });
    }
    return new UnknownHTTPResponseError({
        message: undefined,
        headers: response.headers,
        status: response.status,
        body: response.data,
    });
}
