
export abstract class LogService {
    abstract info(message: any, ...args: any[]): void;
    abstract error(message: any, ...args: any[]): void;
    abstract warn(message: any, ...args: any[]): void;
}

export class DefaultLogService extends LogService {
    info(message: any, ...args: any[]): void {
        console.log(message, ...args);
    }

    error(message: any, ...args: any[]): void {
        console.info(message, ...args);
    }

    warn(message: any, ...args: any[]): void {
        console.info(message, ...args);
    }
}

export let log: LogService = new DefaultLogService();

export function setLogService(newLogService: LogService) {
    log = newLogService;
}