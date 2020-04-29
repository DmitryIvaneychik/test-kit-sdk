export interface CallObject {
    id: number;
    result_code: number;
    attempt_num: number;
    session_id: string;
    callerid: string;
    destination: string;
    display_name: string;
    phone_a: string;
    phone_b: string;
    record_url: string;
}
export interface ContextObject {
    request: RequestObject;
}
export interface RequestObject {
    body: object;
    headers: object;
}
export interface SkillObject {
    skill_name: string;
    level: number;
}
export interface ResponseDataObject {
    VARIABLES: object;
    SKILLS: Array<SkillObject>;
}
export interface MessageConversation {
    id: number;
    uuid: string;
    client_id: string;
    custom_data: ConversationCustomDataObject;
}
export interface ConversationCustomDataObject {
    client_data: ConversationCustomDataClientDataObject;
    conversation_data: ConversationCustomDataConversationDataObject;
}
export interface ConversationCustomDataClientDataObject {
    client_id: string;
    client_phone: string;
    client_avatar: string;
    client_display_name: string;
}
export interface ConversationCustomDataConversationDataObject {
    last_message_text: string;
    last_message_time: number;
    channel_type: string;
    last_message_sender_type: string;
    is_read: boolean;
}
export interface QueueInfo {
    queue_id: number;
    queue_name: string;
}
export interface MessageObject {
    text: string;
    type: string;
    sender: MessageSender;
    conversation: MessageConversation;
    payload: Array<MessagePayloadItem>;
}
export interface MessageSender {
    is_bot: boolean;
}
export interface MessagePayloadItem {
    type: string;
    message_type?: string;
    name?: string;
    queue?: QueueInfo;
    text?: string;
    url?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    keys?: any;
    file_name?: string;
    file_size?: number;
}
export default class VoximplantKit {
    private requestData;
    private responseData;
    private accessToken;
    private sessionAccessUrl;
    eventType: string;
    call: CallObject;
    variables: object;
    headers: object;
    skills: Array<SkillObject>;
    incomingMessage: MessageObject;
    replyMessage: MessageObject;
    constructor(context: ContextObject);
    getResponseBody(data: any): any;
    getIncomingMessage(): MessageObject;
    setAccessToken(token: any): void;
    getCallData(): any;
    getVariables(): any;
    getSkills(): any;
    setSkill(name: string, level: number): void;
    removeSkill(name: string): void;
    transferToQueue(queue: QueueInfo): boolean;
    cancelTransferToQueue(): boolean;
    addPhoto(url: any): boolean;
}
