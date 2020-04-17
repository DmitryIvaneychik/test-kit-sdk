const EVENT_TYPES = {
    "in_call_function": "in_call_function",
    "incoming_message": "incoming_message",
    "webhook": "webhook"
}

class VoximplantKit {
    constructor(context) {
        // Store request data
        this.requestData = context.request.body

        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook

        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ?  context.request.headers["x-kit-access-token"] : ""

        // Store call data
        this.call = this.getCallData()

        // Store variables data
        this.variables = this.getVariables()

        // Store skills data
        this.skills = this.getSkills()

        // Max skill level
        this.maxSkillLevel = 5

        // Prepare response
        this.response = {
            status: 200,
            body: "",
            headers: {
                "content-type": "application/json"
            }
        }

        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        }
    }

    // Prepare function response
    makeResponse() {
        if (this.eventType === EVENT_TYPES.in_call_function)
            this.response.body = JSON.stringify({
                "VARIABLES": this.variables,
                "SKILLS": this.skills
            })
        else
            this.response.body = JSON.stringify({
                "success": true,
                "result": true
            })

        return this.response
    }

    // Set auth token
    setAccessToken(token) {
        this.accessToken = token
    }

    // Get all call data
    getCallData() {
        return (typeof this.requestData.CALL !== "undefined") ? this.requestData.CALL : null
    }

    // Get all variables
    getVariables() {
        return (typeof this.requestData.VARIABLES !== "undefined") ? this.requestData.VARIABLES : {}
    }

    // Get all skills
    getSkills() {
        return (typeof this.requestData.SKILLS !== "undefined") ? this.requestData.SKILLS : []
    }

    // Set variable
    setVariable(name, value) {
        this.responseData.VARIABLES[name] = value
    }

    // Set skill
    setSkill(id, level) {
        const skillIndex = this.skills.findIndex(skill => {
            return skill.id === id
        })

        if (skillIndex === -1) this.skills.push({
            "skill_id": id,
            "level": level
        })
        else this.skills[skillIndex].level = level
    }

    // Remove skill
    removeSkill(id) {
        const skillIndex = this.skills.findIndex(skill => {
            return skill.skill_id === id
        })

        if (skillIndex > -1) {
            this.skills.splice(skillIndex, 1)
        }
    }
}

export VoximplantKit;
