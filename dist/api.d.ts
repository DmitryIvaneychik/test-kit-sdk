import { AxiosResponse } from 'axios';
export default class api {
    private client;
    constructor(domain: string, token: string, isTest: boolean);
    request<T, R = AxiosResponse<T>>(requestUrl: any, data?: {}): Promise<R>;
}
