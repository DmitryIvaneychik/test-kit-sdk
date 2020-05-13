import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'

export default class api {
    private client:AxiosInstance

    constructor(domain:string, token:string) {

        this.client = axios.create({
            // baseURL: "https://kit.voximplant.com/api",
            baseURL: "https://voximplant.xyz/api",
            method: "POST",
            responseType: "json",
        })

        this.client.interceptors.request.use((param: AxiosRequestConfig) => {
            if (typeof param.params === "undefined") param.params = {}

            param.params.domain = domain
            param.params.access_token = token

            return param
        });
    }

    request<T, R = AxiosResponse<T>> (requestUrl):Promise<R> {
        return this.client.request({
            url: requestUrl
        })
    }
}
