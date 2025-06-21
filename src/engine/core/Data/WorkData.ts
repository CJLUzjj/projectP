import { BuildingType, Position } from "./common";
import { HexCoord } from "./MapData";

// 工作类型枚举
export enum WorkType {
    None = "None",               // 无
    Mining = "Mining",           // 挖矿
    Logging = "Logging",         // 伐木
    Farming = "Farming",         // 农耕
    BuildFarm = "BuildFarm",     // 建造农场
    Sleep = "Sleep",             // 休息
    Soak = "Soak",               // 泡澡
    BuildGun = "BuildGun",       // 建造枪
    BuildSword = "BuildSword",   // 建造剑
}

// 工作能力接口
export class WorkAbility {
    constructor(workType: WorkType, efficiency: number) {
        this.workType = workType;
        this.efficiency = efficiency;
    }
    workType: WorkType;
    efficiency: number;  // 效率 1-100
}

export class WorkCost {
    constructor(itemId: number, quantity: number) {
        this.itemId = itemId;
        this.quantity = quantity;
    }
    itemId: number;
    quantity: number;
}

// 工作产出接口
export class WorkOutput {
    constructor(itemId: number, quantity: number, probability: number) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.probability = probability;
    }
    itemId: number;
    quantity: number;
    probability: number; // 产出概率 0-1
}

export class WorkInfo {
    constructor(workType: WorkType, name: string, description: string, baseTime: number, requiredLevel: number, outputs: WorkOutput[], stamminaCost: number) {
        this.workType = workType;
        this.name = name;
        this.description = description;
        this.baseTime = baseTime;
        this.requiredLevel = requiredLevel;
        this.outputs = outputs;
        this.stamminaCost = stamminaCost;
    }
    workType: WorkType;
    name: string;
    description: string;
    baseTime: number;
    requiredLevel: number;
    outputs: WorkOutput[];
    stamminaCost: number;    // 体力消耗
}

export abstract class BaseWork {
    workType: WorkType;
    baseTime: number;
    requiredLevel: number;
    stamminaCost: number;
    constructor(workType: WorkType, baseTime: number, requiredLevel: number, stamminaCost: number) {
        this.workType = workType;
        this.baseTime = baseTime;
        this.requiredLevel = requiredLevel;
        this.stamminaCost = stamminaCost;
    }
}

export class ProductionWork extends BaseWork {
    constructor(workType: WorkType, baseTime: number, requiredLevel: number, stamminaCost: number, outputs: WorkOutput[]) {
        super(workType, baseTime, requiredLevel, stamminaCost);
        this.outputs = outputs;
    }
    outputs: WorkOutput[];
}

export class RestWork extends BaseWork {
    constructor(workType: WorkType, efficiency: number) {
        super(workType, 0, 0, 0);
        this.efficiency = efficiency;
    }
    efficiency: number;
}

export class BuildingWork extends BaseWork {
    constructor(workType: WorkType, baseTime: number, requiredLevel: number, stamminaCost: number, inputs: WorkCost[], buildingType: BuildingType) {
        super(workType, baseTime, requiredLevel, stamminaCost);
        this.inputs = inputs;
        this.buildingType = buildingType;
    }
    inputs: WorkCost[];
    buildingType: BuildingType;
}

export class SyntheticWork extends BaseWork {
    constructor(workType: WorkType, baseTime: number, requiredLevel: number, stamminaCost: number, inputs: WorkCost[], outputs: WorkOutput[]) {
        super(workType, baseTime, requiredLevel, stamminaCost);
        this.inputs = inputs;
        this.outputs = outputs;
    }
    inputs: WorkCost[];
    outputs: WorkOutput[];
}

export class BaseWorkProgressData {
    monsterId: number;
    workType: WorkType;
    startTime: number;
    endTime: number;
    progress: number;
    buildingId: number;
    hexPos: HexCoord;
    constructor(monsterId: number, workType: WorkType, startTime: number, endTime: number, progress: number, buildingId: number, hexPos: HexCoord) {
        this.monsterId = monsterId;
        this.workType = workType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.progress = progress;
        this.buildingId = buildingId;
        this.hexPos = hexPos;
    }
}

export class ProductionWorkProgressData extends BaseWorkProgressData {
    workConfig: ProductionWork;
    constructor(monsterId: number, workType: WorkType, startTime: number, endTime: number, progress: number, buildingId: number, hexPos: HexCoord, workConfig: ProductionWork) {
        super(monsterId, workType, startTime, endTime, progress, buildingId, hexPos);
        this.workConfig = workConfig;
    }
}

export class BuildingWorkProgressData extends BaseWorkProgressData {
    workConfig: BuildingWork;
    constructor(monsterId: number, workType: WorkType, startTime: number, endTime: number, progress: number, buildingId: number, hexPos: HexCoord, workConfig: BuildingWork) {
        super(monsterId, workType, startTime, endTime, progress, buildingId, hexPos);
        this.workConfig = workConfig;
    }
}

export class RestWorkProgressData extends BaseWorkProgressData {
    workConfig: RestWork;
    constructor(monsterId: number, workType: WorkType, startTime: number, endTime: number, progress: number, buildingId: number, hexPos: HexCoord, workConfig: RestWork) {
        super(monsterId, workType, startTime, endTime, progress, buildingId, hexPos);
        this.workConfig = workConfig;
    }
}

export class SyntheticWorkProgressData extends BaseWorkProgressData {
    workConfig: SyntheticWork;
    constructor(monsterId: number, workType: WorkType, startTime: number, endTime: number, progress: number, buildingId: number, hexPos: HexCoord, workConfig: SyntheticWork) {
        super(monsterId, workType, startTime, endTime, progress, buildingId, hexPos);
        this.workConfig = workConfig;
    }
}
