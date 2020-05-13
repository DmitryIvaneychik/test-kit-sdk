import { AxiosResponse } from 'axios';
export default class api {
    private client;
    private domain;
    private access_token;
    constructor(domain: string, token: string);
    private transformRequest(data, headers);
    request<T, R = AxiosResponse<T>>(requestUrl: any): Promise<R>;
}
