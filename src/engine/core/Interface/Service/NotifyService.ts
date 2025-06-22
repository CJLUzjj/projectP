export abstract class NotifyService {
    abstract notify(message: string, ...args: any[]): void;
}

export class DefaultNotifyService extends NotifyService {
    notify(message: string, ...args: any[]): void {
        console.log(message, args);
    }
}

export let notify: NotifyService = new DefaultNotifyService();

export function setNotifyService(newNotifyService: NotifyService) {
    notify = newNotifyService;
}