import axios, {AxiosInstance, AxiosTransformer, AxiosResponse} from 'axios'

export default class api {
    private client:AxiosInstance
    private domain:string
    private access_token:string
    constructor(domain:string, token:string) {
        this.domain = domain
        this.access_token = token

        this.client = axios.create({
            baseURL: "https://kit.voximplant.com/api",
            method: "POST",
            responseType: "json",
            transformRequest: this.transformRequest
        })
    }
    private transformRequest(data, headers):AxiosTransformer {
        data.domain = this.domain
        data.access_token = this.access_token
        return data
    }

    request<T, R = AxiosResponse<T>> (requestUrl):Promise<R> {
        return this.client.request({
            url: requestUrl
        })
    }
}
