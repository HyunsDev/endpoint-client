<!-- <p align="center">
  <img src="./assets/icon.png" width="10%" alt="icon" />
</p> -->
<h1 align="center">endpoint-client</h1>
<h5 align="center">타입 안전한 API 엔드포인트 추상화</h5>
<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-blue"/></a>
  <img alt="MIT License" src="https://img.shields.io/badge/Language-Typescript-blue?logo=typescript"/>
</p>

---

## install

```
npm install endpoint-client
yarn add endpoint-client
```

## Usage

### 엔드포인트 정의

```typescript
import { Endpoint } from "endpoint-client";

export type getEndpointParameter = {
    pathItem: string;
    bodyItem: string;
    queryItem: string;
};

export type getEndpointResponse = {
    name: string;
};

export const getEndpoint: Endpoint<getEndpointParameter, getEndpointResponse> =
    {
        method: "GET",
        path: (e) => `/endpoint/${e.pathItem}`,
        bodyParams: ["bodyItem"],
        pathParams: ["pathItem"],
        queryParams: ["queryItem"],
    };
```

### 클라이언트 정의

```typescript
import { EndpointClient } from "endpoint-client";
import { getEndpoint } from "...";

export class Client extends EndpointClient {
    readonly endpoint = {
        get: this.endpointBuilder(getEndpoint),
    };
}

export const client = new Client({
    baseUrl: "https://api.example/com",
});
```

### 엔드포인트 사용

```typescript
...
    const res = await client.endpoint.get({
        pathItem: 'a',
        bodyItem: 'b',
        queryItem: 'c',
    });
    console.log(res);
...

```
