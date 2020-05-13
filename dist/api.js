"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class api {
    constructor(domain, token) {
        this.client = axios_1.default.create({
            // baseURL: "https://kit.voximplant.com/api",
            baseURL: "https://voximplant.xyz/api",
            method: "POST",
            responseType: "json",
        });
        this.client.interceptors.request.use((param) => {
            if (typeof param.params === "undefined")
                param.params = {};
            param.params.domain = domain;
            param.params.access_token = token;
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
