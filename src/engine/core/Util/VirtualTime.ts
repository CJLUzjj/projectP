
export class VirtualTime {
    private static instance: VirtualTime;
    private time: number;

    private constructor() {
        this.time = Date.now();
    }

    public static getInstance(): VirtualTime {
        if (!VirtualTime.instance) {
            VirtualTime.instance = new VirtualTime();
        }
        return VirtualTime.instance;
    }
    
    public getTime(): number {
        return this.time;
    }

    public getDate(): Date {
        return new Date(this.time);
    }

    public updateTimeByFrame(frame: number): void {
        const deltaTime = 1000 / frame;
        this.time += deltaTime;
    }

    public updateTimeByDelta(deltaTimeMs: number): void {
        this.time += deltaTimeMs;
    }
}