export enum MonsterType {
    None = "None",
    Goblin = "Goblin",
    Orc = "Orc",
    Troll = "Troll",
    Dragon = "Dragon",
    Demon = "Demon",
    Undead = "Undead",
}

// 帕鲁状态枚举
export enum PalStatus {
    Idle = "Idle",        // 待机
    Working = "Working",  // 工作中
    Resting = "Resting"   // 休息中
}

// 建筑类型枚举
export enum BuildingType {
    Farm = "Farm",                   // 农场 - 农耕
    Mine = "Mine",                   // 矿场 - 挖矿
    Lumberyard = "Lumberyard",       // 伐木场 - 伐木
    Workshop = "Workshop",           // 工坊 - 制作
    Kitchen = "Kitchen",             // 厨房 - 烹饪
    Forge = "Forge",                 // 锻造场 - 建造
    Warehouse = "Warehouse",         // 仓库 - 运输
    Barracks = "Barracks",           // 军营 - 守卫
    Laboratory = "Laboratory",       // 实验室 - 研究
    HuntingLodge = "HuntingLodge",   // 狩猎小屋 - 狩猎
    RestArea = "RestArea"            // 休息区 - 休息
}

// 道具类型枚举
export enum ItemType {
    // 基础资源
    Stone = "Stone",
    Wood = "Wood",
    Food = "Food",
    Metal = "Metal",
    Crystal = "Crystal",
    Herb = "Herb",
    
    // 制作材料
    Cloth = "Cloth",
    Leather = "Leather",
    Potion = "Potion",
    
    // 高级道具
    Weapon = "Weapon",
    Armor = "Armor",
    Tool = "Tool",
    
    // 特殊道具
    Rare = "Rare",
    Legendary = "Legendary"
} 

export enum SpaceType {
    Hall = "hall",
    Room = "room",
}

export enum WorkBaseType {
    Production = "Production",
    Building = "Building",
    Rest = "Rest",
    Synthetic = "Synthetic",
}

export interface Position {
    x: number;
    y: number;
}

export enum WorkStatus {
    None = "None",
    Moving = "Moving",
    MovingDone = "MovingDone",
    Working = "Working",
    Finished = "Finished",
    Canceled = "Canceled",
}