import { BuildingPropertyComponent } from "../../../Component/Property/BuildingPropertyComponent";
import { BuildingData } from "../../../Data/BuildingData";
import { BuildingType } from "../../../Data/common";
import { BuildingConfig } from "../../../Data/config/BuildingConfig";
import { BuildingIdGenerator } from "../../../Util/IdGenerator";
import { MonsterBaseProperty, MonsterWorkProperty } from "../../../Data/MonsterData";
import { Monster } from "../../../Entity/Monster";
import { WorkType } from "../../../Data/WorkData";
import { getMonsterWorkEfficiency } from "../Work/Common";
import { WorkInfoConfig } from "../../../Data/config/WorkInfoConfig";
import { log } from "../../../Interface/Service/LogService";
import { HexCoord } from "../../../Data/MapData";

export function addDefaultBuilding(buildingType: BuildingType): BuildingData {
    // 根据建筑类型创建建筑实例
    const template = BuildingConfig.get(buildingType);
    if (!template) {
        throw new Error(`建筑类型 ${buildingType} 不存在`);
    }

    // toto: 这里使用了浅拷贝
    const building = {
        ...template,
        currentWorkers: 0
    };

    return building;
}


export function calculateWorkTime(buildingProperty: BuildingPropertyComponent, monsterProperty: MonsterBaseProperty,
    workType: WorkType
): number {
    // 计算工作时间（基于效率和建筑加成）
    let buildingEfficiency = buildingProperty.getData()?.efficiency;
    if (!buildingEfficiency) {
        buildingEfficiency = 1;
    }

    const efficiency = getMonsterWorkEfficiency(monsterProperty.type, workType);
    const totalEfficiency = (efficiency / 100) * buildingEfficiency;
    const workConfig = WorkInfoConfig.get(workType);
    if (!workConfig) {
        throw new Error(`工作类型 ${workType} 不存在`);
    }

    log.info("workConfig.baseTime", workConfig.baseTime);
    log.info("totalEfficiency", totalEfficiency);
    return Math.round(workConfig.baseTime * 1000 / totalEfficiency);
}