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
        this.functionId = null;
        this.eventType = EVENT_TYPES.webhook;
        this.call = null;
        this.variables = {};
        this.headers = {};
        this.skills = [];
        // maxSkillLevel:number = 5
        this.conversationDB = {};
        this.functionDB = {};
        this.accountDB = {};
        this.db = {};
        this.isTest = isTest;
        this.http = axios_1.default;
        if (typeof context.request === "undefined") {
            context.request = {
                body: {},
                headers: {}
            };
        }
        // Store request data
        this.requestData = context.request.body;
        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook;
        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ? context.request.headers["x-kit-access-token"] : "";
        // Get domain
        this.domain = (typeof context.request.headers["x-kit-domain"] !== "undefined") ? context.request.headers["x-kit-domain"] : "annaclover";
        // Get function ID
        this.functionId = (typeof context.request.headers["x-kit-function-id"] !== "undefined") ? context.request.headers["x-kit-function-id"] : 88;
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
            console.log('type', typeof this.requestData);
            console.log('data', this.requestData);
            this.incomingMessage = this.getIncomingMessage();
            this.replyMessage.type = this.requestData.type;
            this.replyMessage.sender.is_bot = true;
            this.replyMessage.conversation = this.requestData.conversation;
            this.replyMessage.payload.push({
                type: "properties",
                message_type: "text"
            });
        }
    }
    // load Databases
    async loadDatabases() {
        let _this = this;
        let _DBs = [
            this.loadDB("function_" + this.functionId),
            this.loadDB("accountdb_" + this.domain)
        ];
        if (this.eventType === EVENT_TYPES.incoming_message) {
            _DBs.push(this.loadDB("conversation_" + this.incomingMessage.conversation_uuid));
        }
        await axios_1.default.all(_DBs).then(axios_1.default.spread((func, acc, conv) => {
            _this.functionDB = (typeof func !== "undefined" && typeof func.result !== "undefined" && func.result !== null) ? JSON.parse(func.result) : {};
            _this.accountDB = (typeof acc !== "undefined" && typeof acc.result !== "undefined" && acc.result !== null) ? JSON.parse(acc.result) : {};
            _this.conversationDB = (typeof conv !== "undefined" && typeof acc.result !== "undefined" && acc.result !== null) ? JSON.parse(conv.result) : {};
            _this.db = {
                function: _this.functionDB,
                global: _this.accountDB,
                conversation: _this.conversationDB
            };
        }));
    }
    // Get function response
    getResponseBody(data) {
        if (this.eventType === EVENT_TYPES.in_call_function)
            return {
                "VARIABLES": this.variables,
                "SKILLS": this.skills
            };
        if (this.eventType === EVENT_TYPES.incoming_message)
            return this.replyMessage;
        else
            return data;
    }
    // Get incoming message
    getIncomingMessage() {
        return {
            text: this.requestData.text,
            type: this.requestData.type,
            conversation_uuid: this.requestData.conversation.uuid,
            client_data: this.requestData.conversation.custom_data.client_data,
            conversation_data: this.requestData.conversation.custom_data.conversation_data
        };
    }
    // Set auth token
    setAccessToken(token) {
        this.accessToken = token;
    }
    // Get Variable
    getVariable(name) {
        return (typeof this.variables[name] !== "undefined") ? this.variables[name] : null;
    }
    // Set variable
    setVariable(name, value) {
        this.variables[name] = value;
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
        return this.api.request("/v2/kv/get", {
            key: db_name
        }).then((response) => {
            return response.data;
        }).catch(e => {
            return {};
        });
    }
    saveDB(db_name, value) {
        return this.api.request("/v2/kv/put", {
            key: db_name,
            value: value,
            ttl: -1
        }).then((response) => {
            return response.data;
        }).catch(e => {
            return {};
        });
    }
    // Save DB by scope name
    saveDb(type) {
        let _dbName = null;
        let _dbValue = null;
        if (type === "function") {
            _dbName = "function_" + this.functionId;
            _dbValue = this.functionDB;
        }
        if (type === "account") {
            _dbName = "accountdb_" + this.domain;
            _dbValue = this.accountDB;
        }
        if (type === "conversation" && this.eventType == EVENT_TYPES.incoming_message) {
            _dbName = "conversation_" + this.incomingMessage.conversation_uuid;
            _dbValue = this.conversationDB;
        }
        if (_dbName === null)
            return false;
        return this.saveDB(_dbName, JSON.stringify(_dbValue));
    }
    // Get value from DB by key
    dbGet(key, scope = "global") {
        return this.db[scope];
    }
    // Set value in DB by key
    dbSet(key, value, scope = "global") {
        this.db[scope][key] = value;
    }
    // Get all DB scope by name
    dbGetAll(scope = "global") {
        return typeof this.db[scope] !== "undefined" ? this.db[scope] : null;
    }
    // Commit DB chnges
    async dbCommit() {
        let _this = this;
        let _DBs = [
            this.saveDB("function_" + this.functionId, JSON.stringify(this.db.function)),
            this.saveDB("accountdb_" + this.domain, JSON.stringify(this.db.global))
        ];
        if (this.eventType === EVENT_TYPES.incoming_message) {
            _DBs.push(this.saveDB("conversation_" + this.incomingMessage.conversation_uuid, JSON.stringify(this.db.conversation)));
        }
        await axios_1.default.all(_DBs).then(axios_1.default.spread((func, acc, conv) => {
            console.log("result", func, acc, conv);
        }));
    }
    // Send SMS message
    sendSMS(from, to, message) {
        return this.api.request("/v2/phone/sendSms", {
            source: from,
            destination: to,
            sms_body: message
        }).then(r => { return r.data; });
    }
    // Voximplant Kit API proxy
    apiProxy(url, data) {
        return this.api.request(url, data).then(r => { return r.data; });
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
    // Client version
    version() {
        return "0.0.16";
    }
}
exports.default = VoximplantKit;
