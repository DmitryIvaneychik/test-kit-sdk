import { AxiosResponse } from 'axios';
export default class api {
    private client;
    constructor(domain: string, token: string);
    request<T, R = AxiosResponse<T>>(requestUrl: any): Promise<R>;
}
