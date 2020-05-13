"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class api {
    constructor(domain, token) {
        this.domain = domain;
        this.access_token = token;
        this.client = axios_1.default.create({
            baseURL: "https://kit.voximplant.com/api",
            method: "POST",
            responseType: "json",
        });
        const _this = this;
        this.client.interceptors.request.use((param) => {
            param.params.domain = _this.domain;
            param.params.access_token = _this.access_token;
            return param;
        });
    }
    request(requestUrl) {
        return this.client.request({
            url: requestUrl
        });
    }
}
exports.default = api;
