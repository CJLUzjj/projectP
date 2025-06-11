import { log } from "./LogService";

export class Message {
    public id: number;
    public args: any;

    constructor(id: number, args: any) {
        this.id = id;
        this.args = args;
    }
}

export class MessageService {
    private messageList: Message[] = [];

    // 平台调用
    pushMessage(id: number, args: any) {
        log.info("pushMessage", id, args);
        this.messageList.push(new Message(id, args));
    }

    // 逻辑层调用
    popMessage(): Message | null {
        if (this.messageList.length > 0) {
            log.info("popMessage", this.messageList.length);
            return this.messageList.shift() as Message;
        }
        return null;
    }
}

export let globalMessageService: MessageService = new MessageService();

export function setGlobalMessageService(newMessageService: MessageService) {
    if (globalMessageService) {
        throw new Error("MessageService already set");
    }
    globalMessageService = newMessageService;
}