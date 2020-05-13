import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'

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
        })

        const _this = this
        this.client.interceptors.request.use((param: AxiosRequestConfig) => {
            param.params.domain = _this.domain
            param.params.access_token = _this.access_token

            return param
        });
    }

    request<T, R = AxiosResponse<T>> (requestUrl):Promise<R> {
        return this.client.request({
            url: requestUrl
        })
    }
}
