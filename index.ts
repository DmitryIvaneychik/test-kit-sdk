const EVENT_TYPES = {
    in_call_function: "in_call_function",
    incoming_message: "incoming_message",
    webhook: "webhook"
}

interface CallObject {
    id:number
    result_code:number
    attempt_num:number
    session_id:string
    callerid:string
    destination:string
    display_name:string
    phone_a:string
    phone_b:string
    record_url:string
}
interface ContextObject {
    request:RequestObject
}

interface RequestObject {
    body:object
    headers:object
}

interface SkillObject {
    skill_name:string
    level:number
}

interface ResponseDataObject {
    VARIABLES:object
    SKILLS:Array<SkillObject>
}

export default class VoximplantKit {
    private requestData:any = {}
    private responseData:ResponseDataObject = {
        VARIABLES:{},
        SKILLS:[]
    }

    private accessToken:string = null
    private sessionAccessUrl:string = null
    eventType:string = EVENT_TYPES.webhook
    call:CallObject = null
    variables:object = {}
    headers:object = {}
    skills:Array<SkillObject> = []
    // maxSkillLevel:number = 5

    constructor(context:ContextObject) {
        // Store request data
        this.requestData = context.request.body
        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook
        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ?  context.request.headers["x-kit-access-token"] : ""
        // Get session access url
        this.sessionAccessUrl = (typeof context.request.headers["x-kit-session-access-url"] !== "undefined") ?  context.request.headers["x-kit-session-access-url"] : ""
        // Store call data
        this.call = this.getCallData()
        // Store variables data
        this.variables = this.getVariables()
        // Store skills data
        this.skills = this.getSkills()

        this.responseData = {
            VARIABLES: {},
            SKILLS: []
        }
    }
    // Get function response
    getResponseBody(data:any) {
        if (this.eventType === EVENT_TYPES.in_call_function)
            return {
                "VARIABLES": this.variables,
                "SKILLS": this.skills
            }
        else
            return data
    }
    // Set auth token
    setAccessToken(token){
        this.accessToken = token
    }
    // Get all call data
    getCallData(){
        return (typeof this.requestData.CALL !== "undefined") ? this.requestData.CALL : null
    }
    // Get all variables
    getVariables(){
        return (typeof this.requestData.VARIABLES !== "undefined") ? this.requestData.VARIABLES : {}
    }
    // Get all skills
    getSkills(){
        return (typeof this.requestData.SKILLS !== "undefined") ? this.requestData.SKILLS : []
    }

    // Set skill
    setSkill(name:string, level:number){
        const skillIndex = this.skills.findIndex(skill => {
            return skill.skill_name === name
        })
        if (skillIndex === -1) this.skills.push({
            "skill_name": name,
            "level": level
        })
        else this.skills[skillIndex].level = level
    }
    // Remove skill
    removeSkill(name:string){
        const skillIndex = this.skills.findIndex(skill => {
            return skill.skill_name === name
        })
        if (skillIndex > -1) {
            this.skills.splice(skillIndex, 1)
        }
    }
}
