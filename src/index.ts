import axios, {AxiosInstance} from 'axios'
import api from "./api"
import setPrototypeOf = Reflect.setPrototypeOf;

const EVENT_TYPES = {
    in_call_function: "in_call_function",
    incoming_message: "incoming_message",
    webhook: "webhook"
}

export interface CallObject {
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
export interface ContextObject {
    request:RequestObject
}

export interface RequestObject {
    body:object
    headers:object
}

export interface SkillObject {
    skill_name:string
    level:number
}

export interface ResponseDataObject {
    VARIABLES:object
    SKILLS:Array<SkillObject>
}

export interface MessageConversation {
    id:number
    uuid:string
    client_id:string
    custom_data:ConversationCustomDataObject
}

export interface ConversationCustomDataObject {
    client_data:ConversationCustomDataClientDataObject
    conversation_data:ConversationCustomDataConversationDataObject
}

export interface ConversationCustomDataClientDataObject {
    client_id:string
    client_phone:string
    client_avatar:string
    client_display_name:string
}

export interface ConversationCustomDataConversationDataObject {
    last_message_text:string
    last_message_time:number
    channel_type:string
    last_message_sender_type:string
    is_read:boolean
}

export interface QueueInfo {
    queue_id:number
    queue_name:string
}

export interface MessageObject {
    text:string
    type:string
    sender:MessageSender
    conversation:MessageConversation
    payload:Array<MessagePayloadItem>
}

export interface MessageSender {
    is_bot:boolean
}

export interface MessagePayloadItem {
    type:string
    message_type?:string
    name?:string
    queue?:QueueInfo
    text?:string
    url?:string
    latitude?:number
    longitude?:number
    address?:string
    keys?:any
    file_name?:string
    file_size?:number
}

export default class VoximplantKit {
    private isTest:boolean = false
    private requestData:any = {}
    private responseData:ResponseDataObject = {
        VARIABLES:{},
        SKILLS:[]
    }
    // private responseMessageData:MessageObject = {}

    private accessToken:string = null
    private sessionAccessUrl:string = null
    private domain:string = null
    private functionId:number = null

    eventType:string = EVENT_TYPES.webhook
    call:CallObject = null
    variables:object = {}
    headers:object = {}
    skills:Array<SkillObject> = []

    incomingMessage:MessageObject
    replyMessage:MessageObject
    // maxSkillLevel:number = 5

    conversationDB:any = {}
    functionDB:any = {}

    api:any
    http:AxiosInstance

    constructor(context:ContextObject, isTest:boolean = false) {
        this.isTest = isTest
        this.http = axios
        // Store request data
        this.requestData = context.request.body
        // Get event type
        this.eventType = (typeof context.request.headers["x-kit-event-type"] !== "undefined") ? context.request.headers["x-kit-event-type"] : EVENT_TYPES.webhook
        // Get access token
        this.accessToken = (typeof context.request.headers["x-kit-access-token"] !== "undefined") ?  context.request.headers["x-kit-access-token"] : ""
        // Get domain
        this.domain = (typeof context.request.headers["x-kit-domain"] !== "undefined") ?  context.request.headers["x-kit-domain"] : "annaclover"
        // Get function ID
        this.functionId = (typeof context.request.headers["x-kit-function-id"] !== "undefined") ?  context.request.headers["x-kit-function-id"] : 88
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

        this.api = new api(this.domain, this.accessToken, this.isTest)

        if (this.eventType === EVENT_TYPES.incoming_message) {
            this.incomingMessage = this.getIncomingMessage()
            this.replyMessage.type = this.incomingMessage.type
            this.replyMessage.sender.is_bot = true
            this.replyMessage.conversation = this.incomingMessage.conversation
            this.replyMessage.payload.push({
                type: "properties",
                message_type: "text"
            });

            this.conversationDB = function () {
                this.loadConversationDB("conversation_" + this.incomingMessage.conversation.uuid).then(r => {
                    return JSON.parse(r)
                })
            }
        }

        this.functionDB = function () {
            this.loadDB("function_" + this.functionId).then(r => {
                return JSON.parse(r)
            })
        }
    }

    /*async loadDBs() {

        let _DBs = [];

        if (this.eventType === EVENT_TYPES.incoming_message) {
            _DBs.push(this.loadDB("conversation_" + this.incomingMessage.conversation.uuid))
        }

        this.api.all(_DBs)
    }*/

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

    // Get incoming message
    getIncomingMessage():MessageObject{
        return this.requestData
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

    // Transfer to queue
    transferToQueue(queue:QueueInfo){
        if (this.eventType !== EVENT_TYPES.incoming_message) return false

        if (typeof queue.queue_id === "undefined") queue.queue_id = null;
        if (typeof queue.queue_name === "undefined") queue.queue_name = null;

        if (queue.queue_id === null && queue.queue_name === null) return false

        const payloadIndex = this.replyMessage.payload.findIndex(item => {
            return item.type === "cmd" && item.name === "transfer_to_queue"
        })
        if (payloadIndex > -1) {
            this.replyMessage.payload[payloadIndex].queue = queue
        } else {
            this.replyMessage.payload.push({
                type:"cmd",
                name:"transfer_to_queue",
                queue:queue
            })
        }

        return true
    }

    // Cancel transfer to queue
    cancelTransferToQueue(){
        const payloadIndex = this.replyMessage.payload.findIndex(item => {
            return item.type === "cmd" && item.name === "transfer_to_queue"
        })
        if (payloadIndex > -1) {
            this.replyMessage.payload.splice(payloadIndex, 1)
        }

        return true
    }

    private loadDB(db_name:string) {
        return this.api.request("/v2/kv/get", {
            key: db_name
        }).then((response) => {
            return response.data
        })
    }

    private saveDB(db_name:string, value:string) {
        return this.api.request("/v2/kv/put", {
            key: db_name,
            ttl: -1
        }).then((response) => {
            return response.data
        })
    }

    saveDb(type:string) {
        let _dbName = null
        let _dbValue = null

        if (type === "function") {
            _dbName = "function_" + this.functionId
            _dbValue = this.functionDB
        }

        if (type === "conversation") {
            _dbName = "function_" + this.functionId
            _dbValue = this.conversationDB
        }

        if (_dbName === null) return false

        this.saveDB(_dbName, JSON.stringify(_dbValue))

        return true
    }

    // Send message
    sendMessage(from:string, to:string, message:string) {
        return this.api.request("/v2/phone/sendSms", {
            source: from,
            destination: to,
            sms_body: message
        }).then(r => { return r.data })
    }

    getAccountInfo() {
        return this.api.request("/v3/account/getAccountInfo").then(r => { return r.data })
    }

    // Add photo
    addPhoto(url) {
        this.replyMessage.payload.push({
            type:"photo",
            url:url,
            file_name:"file",
            file_size:123
        })

        return true
    }
}
