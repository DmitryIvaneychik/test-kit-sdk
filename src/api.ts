import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {qs} from 'qs'

export default class api {
    private client:AxiosInstance

    constructor(domain:string, token:string, isTest:boolean) {

        this.client = axios.create({
            baseURL: isTest ? "https://voximplant.xyz/api" : "https://kit.voximplant.com/api",
            method: "POST",
            responseType: "json",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        this.client.interceptors.request.use((param: AxiosRequestConfig) => {
            if (typeof param.params === "undefined") param.params = {}

            param.params.domain = domain
            param.params.access_token = token

            param.data = qs.stringify(param.data)

            return param
        });
    }

    request<T, R = AxiosResponse<T>> (requestUrl, data = {}):Promise<R> {
        return this.client.request({
            url: requestUrl,
            data: data
        })
    }
}
