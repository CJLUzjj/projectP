import { WorkType } from "./WorkData";
import { BuildingType } from "./common";

// 建筑数据接口
export class BuildingData {
    constructor(type: BuildingType, name: string, description: string, maxWorkers: number, currentWorkers: number, level: number, efficiency: number, cost: BuildingCost, workTypes: WorkType[], workerList: number[]) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.maxWorkers = maxWorkers;
        this.currentWorkers = currentWorkers;
        this.level = level;
        this.efficiency = efficiency;
        this.cost = cost;
        this.workTypes = workTypes;
        this.workerList = workerList;
    }

    type: BuildingType;
    name: string;
    description: string;
    maxWorkers: number;              // 最大工作位数量
    currentWorkers: number;          // 当前工作人数
    level: number;                   // 建筑等级
    efficiency: number;              // 建筑效率加成 (1.0 = 100%)
    cost: BuildingCost;             // 建造成本
    workTypes: WorkType[];  // 支持的工作类型
    workerList: number[];  // 当前工作者列表
}

// 建造成本接口
export class BuildingCost {
    constructor(id: number, wood: number, stone: number, gold: number) {
        this.id = id;
        this.wood = wood;
        this.stone = stone;
        this.gold = gold;
    }
    id: number;
    wood?: number;
    stone?: number;
    gold?: number;

    getId(): number {
        return this.id;
    }
}