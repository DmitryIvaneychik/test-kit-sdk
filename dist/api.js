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
            transformRequest: this.transformRequest
        });
    }
    transformRequest(data, headers) {
        data.domain = this.domain;
        data.access_token = this.access_token;
        return data;
    }
    request(requestUrl) {
        return this.client.request({
            url: requestUrl
        });
    }
}
exports.default = api;
