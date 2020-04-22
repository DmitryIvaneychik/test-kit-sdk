"use strict";
exports.__esModule = true;
var EVENT_TYPES = {
    in_call_function: "in_call_function",
    incoming_message: "incoming_message",
    webhook: "webhook"
};
var VoximplantKit = /** @class */ (function () {
    // maxSkillLevel:number = 5
    function VoximplantKit(context) {
        this.requestData = {};
        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        };
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
    VoximplantKit.prototype.getResponseBody = function (data) {
        if (this.eventType === EVENT_TYPES.in_call_function)
            return {
                "VARIABLES": this.variables,
                "SKILLS": this.skills
            };
        else
            return data;
    };
    // Set auth token
    VoximplantKit.prototype.setAccessToken = function (token) {
        this.accessToken = token;
    };
    // Get all call data
    VoximplantKit.prototype.getCallData = function () {
        return (typeof this.requestData.CALL !== "undefined") ? this.requestData.CALL : null;
    };
    // Get all variables
    VoximplantKit.prototype.getVariables = function () {
        return (typeof this.requestData.VARIABLES !== "undefined") ? this.requestData.VARIABLES : {};
    };
    // Get all skills
    VoximplantKit.prototype.getSkills = function () {
        return (typeof this.requestData.SKILLS !== "undefined") ? this.requestData.SKILLS : [];
    };
    // Set skill
    VoximplantKit.prototype.setSkill = function (name, level) {
        var skillIndex = this.skills.findIndex(function (skill) {
            return skill.skill_name === name;
        });
        if (skillIndex === -1)
            this.skills.push({
                "skill_name": name,
                "level": level
            });
        else
            this.skills[skillIndex].level = level;
    };
    // Remove skill
    VoximplantKit.prototype.removeSkill = function (name) {
        var skillIndex = this.skills.findIndex(function (skill) {
            return skill.skill_name === name;
        });
        if (skillIndex > -1) {
            this.skills.splice(skillIndex, 1);
        }
    };
    return VoximplantKit;
}());
module.exports = VoximplantKit
