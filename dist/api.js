"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const qs_1 = require("qs");
class api {
    constructor(domain, token, isTest) {
        this.client = axios_1.default.create({
            baseURL: isTest ? "https://voximplant.xyz/api" : "https://kit.voximplant.com/api",
            method: "POST",
            responseType: "json",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        this.client.interceptors.request.use((param) => {
            if (typeof param.params === "undefined")
                param.params = {};
            param.params.domain = domain;
            param.params.access_token = token;
            return param;
        });
    }
    request(requestUrl, data = {}) {
        return this.client.request({
            url: requestUrl,
            data: qs_1.default.stringify(data)
        });
    }
}
exports.default = api;
