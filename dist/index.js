"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EVENT_TYPES = {
    in_call_function: "in_call_function",
    incoming_message: "incoming_message",
    webhook: "webhook"
};
class VoximplantKit {
    // maxSkillLevel:number = 5
    constructor(context) {
        this.requestData = {};
        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        };
        // private responseMessageData:MessageObject = {}
        this.accessToken = null;
        this.sessionAccessUrl = null;
        this.eventType = EVENT_TYPES.webhook;
        this.call = null;
        this.variables = {};
        this.headers = {};
        this.skills = [];
        // Store request data
        this.requestData = context.request.body;
        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook;
        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ? context.request.headers["x-kit-access-token"] : "";
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
}
exports.default = VoximplantKit;
