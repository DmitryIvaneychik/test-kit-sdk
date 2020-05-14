"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const api_1 = require("./api");
const EVENT_TYPES = {
    in_call_function: "in_call_function",
    incoming_message: "incoming_message",
    webhook: "webhook"
};
class VoximplantKit {
    constructor(context, isTest = false) {
        this.isTest = false;
        this.requestData = {};
        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        };
        // private responseMessageData:MessageObject = {}
        this.accessToken = null;
        this.sessionAccessUrl = null;
        this.domain = null;
        this.eventType = EVENT_TYPES.webhook;
        this.call = null;
        this.variables = {};
        this.headers = {};
        this.skills = [];
        this.isTest = isTest;
        this.http = axios_1.default;
        // Store request data
        this.requestData = context.request.body;
        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook;
        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ? context.request.headers["x-kit-access-token"] : "";
        // Get domain
        this.domain = (typeof context.request.headers["x-kit-domain"] !== "undefined") ? context.request.headers["x-kit-domain"] : "annaclover";
        // Get session access url
        this.sessionAccessUrl = (typeof context.request.headers["x-kit-session-access-url"] !== "undefined") ? context.request.headers["x-kit-session-access-url"] : "";
        // Store call data
        this.call = this.getCallData();
        // Store variables data
        this.variables = this.getVariables();
        // Store skills data
        this.skills = this.getSkills();
        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        };
        this.api = new api_1.default(this.domain, this.accessToken, this.isTest);
        if (this.eventType === EVENT_TYPES.incoming_message) {
            this.incomingMessage = this.getIncomingMessage();
            this.replyMessage.type = this.incomingMessage.type;
            this.replyMessage.sender.is_bot = true;
            this.replyMessage.conversation = this.incomingMessage.conversation;
            this.replyMessage.payload.push({
                type: "properties",
                message_type: "text"
            });
        }
    }
    // Get function response
    getResponseBody(data) {
        if (this.eventType === EVENT_TYPES.in_call_function)
            return {
                "VARIABLES": this.variables,
                "SKILLS": this.skills
            };
        else
            return data;
    }
    // Get incoming message
    getIncomingMessage() {
        return this.requestData;
    }
    // Set auth token
    setAccessToken(token) {
        this.accessToken = token;
    }
    // Get all call data
    getCallData() {
        return (typeof this.requestData.CALL !== "undefined") ? this.requestData.CALL : null;
    }
    // Get all variables
    getVariables() {
        return (typeof this.requestData.VARIABLES !== "undefined") ? this.requestData.VARIABLES : {};
    }
    // Get all skills
    getSkills() {
        return (typeof this.requestData.SKILLS !== "undefined") ? this.requestData.SKILLS : [];
    }
    // Set skill
    setSkill(name, level) {
        const skillIndex = this.skills.findIndex(skill => {
            return skill.skill_name === name;
        });
        if (skillIndex === -1)
            this.skills.push({
                "skill_name": name,
                "level": level
            });
        else
            this.skills[skillIndex].level = level;
    }
    // Remove skill
    removeSkill(name) {
        const skillIndex = this.skills.findIndex(skill => {
            return skill.skill_name === name;
        });
        if (skillIndex > -1) {
            this.skills.splice(skillIndex, 1);
        }
    }
    // Transfer to queue
    transferToQueue(queue) {
        if (this.eventType !== EVENT_TYPES.incoming_message)
            return false;
        if (typeof queue.queue_id === "undefined")
            queue.queue_id = null;
        if (typeof queue.queue_name === "undefined")
            queue.queue_name = null;
        if (queue.queue_id === null && queue.queue_name === null)
            return false;
        const payloadIndex = this.replyMessage.payload.findIndex(item => {
            return item.type === "cmd" && item.name === "transfer_to_queue";
        });
        if (payloadIndex > -1) {
            this.replyMessage.payload[payloadIndex].queue = queue;
        }
        else {
            this.replyMessage.payload.push({
                type: "cmd",
                name: "transfer_to_queue",
                queue: queue
            });
        }
        return true;
    }
    // Cancel transfer to queue
    cancelTransferToQueue() {
        const payloadIndex = this.replyMessage.payload.findIndex(item => {
            return item.type === "cmd" && item.name === "transfer_to_queue";
        });
        if (payloadIndex > -1) {
            this.replyMessage.payload.splice(payloadIndex, 1);
        }
        return true;
    }
    loadDB(db_name) {
    }
    // Send message
    sendMessage(from, to, message) {
        return this.api.request("/v2/phone/sendSms", {
            source: from,
            destination: to,
            sms_body: message
        });
    }
    getAccountInfo() {
        return this.api.request("/v3/account/getAccountInfo");
    }
    // Add photo
    addPhoto(url) {
        this.replyMessage.payload.push({
            type: "photo",
            url: url,
            file_name: "file",
            file_size: 123
        });
        return true;
    }
}
exports.default = VoximplantKit;
