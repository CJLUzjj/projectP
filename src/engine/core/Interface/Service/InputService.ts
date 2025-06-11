
// 需要上层继承并绑定对应的按键
export abstract class InputService {
    abstract pressA(): boolean;
}

export let globalInputService: InputService | null = null;

export function setGlobalInputService(newInputService: InputService) {
    if (globalInputService) {
        throw new Error("InputService already set");
    }
    globalInputService = newInputService;
}