export enum APIErrorCode {
    Unauthorized = "unauthorized",
    ServiceUnavailable = "service_unavailable",
    InternalServerError = "internal_server_error",
    RateLimited = "rate_limited",
    InvalidRequestURL = "invalid_request_url",
    InvalidRequest = "invalid_request",
    ValidationError = "validation_error",
}

export enum ClientErrorCode {
    RequestTimeout = "client_request_timeout",
    ResponseError = "client_response_error",
}

export type ErrorCode = APIErrorCode | ClientErrorCode;
