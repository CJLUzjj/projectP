import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { HexCoord } from "../../Data/MapData";

export enum RandomWalkState {
    Idle = "Idle",           // 空闲状态
    Moving = "Moving",       // 移动中
    Arrived = "Arrived"      // 已到达目标
}

@RegisterComponent("RandomWalk")
export class RandomWalkComponent extends BaseComponent {
    private state: RandomWalkState;
    private targetHexCoord: HexCoord | null;
    private walkRadius: number;           // 游走半径
    private walkInterval: number;         // 游走间隔时间（毫秒）
    private lastWalkTime: number;         // 上次游走时间
    private currentWalkTime: number;      // 当前游走开始时间
    private walkDuration: number;         // 单次游走持续时间（毫秒）

    constructor(owner: BaseEntity) {
        super(owner, "RandomWalk");
        this.state = RandomWalkState.Idle;
        this.targetHexCoord = null;
        this.walkRadius = 3;              // 默认游走半径3个六边形
        this.walkInterval = 5000;         // 默认5秒间隔
        this.lastWalkTime = 0;
        this.currentWalkTime = 0;
        this.walkDuration = 3000;         // 默认3秒游走时间
    }

    // 获取当前状态
    getState(): RandomWalkState {
        return this.state;
    }

    // 设置状态
    setState(state: RandomWalkState): void {
        this.state = state;
    }

    // 获取目标坐标
    getTargetHexCoord(): HexCoord | null {
        return this.targetHexCoord;
    }

    // 设置目标坐标
    setTargetHexCoord(coord: HexCoord | null): void {
        this.targetHexCoord = coord;
    }

    // 获取游走半径
    getWalkRadius(): number {
        return this.walkRadius;
    }

    // 设置游走半径
    setWalkRadius(radius: number): void {
        this.walkRadius = radius;
    }

    // 获取游走间隔
    getWalkInterval(): number {
        return this.walkInterval;
    }

    // 设置游走间隔
    setWalkInterval(interval: number): void {
        this.walkInterval = interval;
    }

    // 获取游走持续时间
    getWalkDuration(): number {
        return this.walkDuration;
    }

    // 设置游走持续时间
    setWalkDuration(duration: number): void {
        this.walkDuration = duration;
    }

    // 获取上次游走时间
    getLastWalkTime(): number {
        return this.lastWalkTime;
    }

    // 设置上次游走时间
    setLastWalkTime(time: number): void {
        this.lastWalkTime = time;
    }

    // 获取当前游走开始时间
    getCurrentWalkTime(): number {
        return this.currentWalkTime;
    }

    // 设置当前游走开始时间
    setCurrentWalkTime(time: number): void {
        this.currentWalkTime = time;
    }

    // 检查是否可以开始新的游走
    canStartNewWalk(currentTime: number): boolean {
        return currentTime - this.lastWalkTime >= this.walkInterval;
    }

    // 检查当前游走是否超时
    isWalkTimeout(currentTime: number): boolean {
        return currentTime - this.currentWalkTime >= this.walkDuration;
    }

    // 重置组件状态
    reset(): void {
        this.state = RandomWalkState.Idle;
        this.targetHexCoord = null;
    }
} 