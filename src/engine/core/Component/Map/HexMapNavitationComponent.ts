import { HexCoord } from "../../Data/MapData";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

export enum NavigationState {
    Idle = "Idle",           // 空闲状态
    Calculating = "Calculating", // 计算路径中
    Moving = "Moving",       // 移动中
    Arrived = "Arrived",     // 已到达
    Failed = "Failed",       // 路径计算失败
    Finished = "Finished"   // 移动完成
}

export interface PathNode {
    coord: HexCoord;
    g: number;  // 从起点到当前节点的代价
    h: number;  // 从当前节点到目标的启发式代价
    f: number;  // f = g + h
    parent: PathNode | null;
}

@RegisterComponent("HexMapNavitation", "State")
export class HexMapNavitationComponent extends BaseComponent {
    private startHexCoord: HexCoord;
    private currentHexCoord: HexCoord;
    private targetHexCoord: HexCoord;
    private spaceId: number;
    private path: HexCoord[] = [];
    private currentPathIndex: number = 0;
    private state: NavigationState = NavigationState.Idle;
    private pathNode: PathNode | null = null;
    private finishSelf: boolean = false;
    // 用于让系统判断这个关注的component是否是自己关注的
    private version: number = 0;

    constructor(owner: BaseEntity, startHexCoord: HexCoord, targetHexCoord: HexCoord, spaceId: number, finishSelf: boolean = false) {
        super(owner, "HexMapNavitation");
        this.startHexCoord = startHexCoord;
        this.currentHexCoord = startHexCoord;
        this.targetHexCoord = targetHexCoord;
        this.spaceId = spaceId;
        this.finishSelf = finishSelf;
    }

    // 获取当前状态
    getState(): NavigationState {
        return this.state;
    }

    // 设置状态
    setState(state: NavigationState): void {
        this.state = state;
    }

    // 获取路径
    getPath(): HexCoord[] {
        return this.path;
    }

    // 设置路径
    setPath(path: HexCoord[]): void {
        this.path = path;
        this.currentPathIndex = 0;
    }

    // 获取当前路径索引
    getCurrentPathIndex(): number {
        return this.currentPathIndex;
    }

    // 获取下一个目标坐标
    getNextTarget(): HexCoord | null {
        if (this.currentPathIndex < this.path.length) {
            return this.path[this.currentPathIndex];
        }
        return null;
    }

    // 移动到下一个路径点
    moveToNextPathPoint(): boolean {
        // 如果当前索引已经是最后一个节点，返回false表示没有更多路径点
        if (this.currentPathIndex >= this.path.length - 1) {
            return false;
        }
        
        // 移动到下一个路径点
        this.currentPathIndex++;
        return true;
    }

    // 检查是否到达目标
    isArrived(): boolean {
        return this.currentPathIndex >= this.path.length - 1;
    }

    // 获取起点坐标
    getStartHexCoord(): HexCoord {
        return this.startHexCoord;
    }

    // 获取当前坐标
    getCurrentHexCoord(): HexCoord {
        return this.currentHexCoord;
    }

    // 设置当前坐标
    setCurrentHexCoord(coord: HexCoord): void {
        this.currentHexCoord = coord;
    }

    // 获取目标坐标
    getTargetHexCoord(): HexCoord {
        return this.targetHexCoord;
    }

    // 设置目标坐标
    setTargetHexCoord(coord: HexCoord): void {
        this.targetHexCoord = coord;
    }

    // 获取空间ID
    getSpaceId(): number {
        return this.spaceId;
    }

    // 重置导航
    reset(startHexCoord: HexCoord, targetHexCoord: HexCoord, spaceId: number, finishSelf: boolean = false): void {
        this.startHexCoord = startHexCoord;
        this.currentHexCoord = startHexCoord;
        this.targetHexCoord = targetHexCoord;
        this.spaceId = spaceId;
        this.finishSelf = finishSelf;
        this.state = NavigationState.Idle;
        this.path = [];
        this.currentPathIndex = 0;
        this.pathNode = null;
        this.version++;
    }

    // 设置路径节点（用于A*算法）
    setPathNode(node: PathNode | null): void {
        this.pathNode = node;
    }

    // 获取路径节点
    getPathNode(): PathNode | null {
        return this.pathNode;
    }

    isFinishSelf(): boolean {
        return this.finishSelf;
    }

    getVersion(): number {
        return this.version;
    }
}