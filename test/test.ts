import { Endpoint, EndpointClient } from "../dist";

// API 정의
type getUserParameter = {
    // id: string;
};
type getUserResponse = {
    // name: string;
};
const getUser: Endpoint<getUserParameter, getUserResponse> = {
    method: "GET",
    path: "/",
    bodyParams: [],
};

// API 클라이언트
class Client extends EndpointClient {
    readonly user = {
        get: this.endpointBuilder(getUser),
    };
}

const client = new Client({
    baseUrl: "https://api.hyuns.dev",
});

// API 사용
(async () => {
    const res = await client.user.get({});
    console.log(res);
})();
