import { WorkType } from "../../../Data/WorkData";
import { MonsterType, PalStatus, WorkBaseType, Position } from "../../../Data/common";
import { MonsterWorkAbilityConfig } from "../../../Data/config/MonsterWorkAbilityConfig";
import { WorkAbility } from "../../../Data/WorkData";
import { Building } from "../../../Entity/Building";
import { BuildingPropertyComponent, BuildingState } from "../../../Component/Property/BuildingPropertyComponent";
import { World } from "../../../Infra/World";
import { Avatar } from "../../../Entity/Avatar";
import { Monster } from "../../../Entity/Monster";
import { MonsterPropertyComponent } from "../../../Component/Property/MonsterPropertyComponent";
import { WorkInfoConfig } from "../../../Data/config/WorkInfoConfig";
import { log } from "../../../Interface/Service/LogService";
import { BuildingWorkConfig } from "../../../Data/config/work/BuildingWork";
import { ProductionWorkConfig } from "../../../Data/config/work/ProductionWork";
import { RestWorkConfig } from "../../../Data/config/work/RestWork";
import { SyntheticWorkConfig } from "../../../Data/config/work/SyntheticWork";
import { checkCanStartProductionWork, createProductionWorkProgress, processFinishProductionWork } from "./ProductionWork";
import { checkCanStartBuildingWork, createBuildingWorkProgress, processCancelBuildingWork, processFinishBuildingWork, tryCreateBuildingForWork } from "./BuildingWork";
import { checkCanStartRestWork, createRestWorkProgress, processFinishRestWork } from "./RestWork";
import { checkCanStartSyntheticWork, createSyntheticWorkProgress, processCancelSyntheticWork, processFinishSyntheticWork } from "./SyntheticWork";
import { ProductionWorkProgressComponent } from "../../../Component/Work/ProductionWorkProgressComponent";
import { BuildingWorkProgressComponent } from "../../../Component/Work/BuildingWorkProgressComponent";
import { RestWorkProgressComponent } from "../../../Component/Work/RestWorkProgressComponent";
import { SyntheticWorkProgressComponent } from "../../../Component/Work/SyntheticWorkProgressComponent";
import { RoomSpace } from "../../../Entity/Space/RoomSpace";
import { HexMapComponent } from "../../../Component/Map/HexMapComponent";
import { HexCoord } from "../../../Data/MapData";
import { PositionComponent } from "../../../Component/Basic/PositionComponent";
export const workIndex: Map<WorkType, WorkBaseType> = new Map();

export function buildIndex() {
    for (const [workType, workConfig] of ProductionWorkConfig) {
        workIndex.set(workType as WorkType, WorkBaseType.Production);
    }

    for (const [workType, workConfig] of BuildingWorkConfig) {
        workIndex.set(workType as WorkType, WorkBaseType.Building);
    }
    
    for (const [workType, workConfig] of  RestWorkConfig) {
        log.info("workType", workType, workConfig);
        workIndex.set(workType as WorkType, WorkBaseType.Rest);
    }

    for (const [workType, workConfig] of  SyntheticWorkConfig) {
        workIndex.set(workType as WorkType, WorkBaseType.Synthetic);
    }

    log.info("workIndex加载完成", workIndex);
}

export function getMonsterWorkEfficiency(monsterType: MonsterType, workType: WorkType): number {
    const abilities = MonsterWorkAbilityConfig.get(monsterType);
    const ability = abilities?.find((a: WorkAbility) => a.workType === workType);
    return ability ? ability.efficiency : 0;
}

export function hasAvailableWorkSlot(building: Building, workType: WorkType): boolean {
    if (building.hasComponent("BuildingProperty")) {
        const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
        const data = buildingPropertyComponent.getData();
        if (data) {
            return data.currentWorkers < data.maxWorkers && data.workTypes.includes(workType);
        }
    }
    return false;
}

export function processStartWork(world: World, avatarId: number, spaceId: number, workType: WorkType, monsterId: number, hexPos: HexCoord): boolean {
    const baseType = workIndex.get(workType);
    if (!baseType) {
        log.info("工作类型不存在", workType);
        return false;
    }

    const avatar = world.getEntitiesManager().getEntity(avatarId) as Avatar;
    if (!avatar) {
        log.info("avatar不存在", avatarId);
        return false;
    }

    const monster = world.getEntitiesManager().getEntity(monsterId) as Monster;
    if (!monster) {
        log.info("怪物不存在", monsterId);
        return false;
    }

    const space = world.getEntitiesManager().getEntity(spaceId) as RoomSpace;
    if (!space) {
        log.info("空间不存在", spaceId);
        return false;
    }

    const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
    if (!hexMapComponent) {
        log.info("空间不存在HexMap组件", spaceId);
        return false;
    }

    const hexTile = hexMapComponent.getHexAt(hexPos);
    if (!hexTile) {
        log.info("位置不存在HexTile", hexPos.q, hexPos.r);
        return false;
    }

    const buildingId = hexTile.entityId;
    let building: Building | null = null;
    if (buildingId == 0 && baseType != WorkBaseType.Building) {
        log.info("位置不存在建筑", hexPos.q, hexPos.r);
        return false;
    } else if (buildingId != 0 && baseType == WorkBaseType.Building) {
        log.info("位置存在建筑", hexPos.q, hexPos.r);
        return false;
    } else {
        building = world.getEntitiesManager().getEntity(buildingId) as Building;
        if (!building) {
            log.info("建筑不存在", buildingId);
            return false;
        }
    }

    const positionComponent = monster.getComponent("Position") as PositionComponent;
    if (positionComponent) {
        const hexCoord = positionComponent.getHexCoord();
        if (hexCoord.q != hexPos.q || hexCoord.r != hexPos.r) {
            log.info("怪物位置与建筑位置不一致", monsterId, hexCoord, hexPos);
            return false;
        }
    }

    if (baseType == WorkBaseType.Building) {
        const workConfig = BuildingWorkConfig.get(workType);
        if (!workConfig) {
            log.info("工作配置不存在", workType);
            return false;
        }
        const newBuilding = tryCreateBuildingForWork(world, avatar, workConfig.buildingType, hexPos);
        building = newBuilding;
    }

    if (!building) {
        log.info("建筑不存在", buildingId);
        return false;
    }

    if (!checkCanStartWork(avatar,monster, building, workType)) {
        return false;
    }

    const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
    buildingPropertyComponent.addWorkers(monsterId);

    const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
    monsterPropertyComponent.startWork(workType, buildingId, world.getCurrentVirtualTime());

    if (baseType == WorkBaseType.Production) {
        createProductionWorkProgress(world, building, monsterId, workType, monsterPropertyComponent.baseProperty, hexPos);
    } else if (baseType == WorkBaseType.Building) {
        createBuildingWorkProgress(world, avatar, building, monsterId, workType, monsterPropertyComponent.baseProperty, hexPos);
    } else if (baseType == WorkBaseType.Rest) {
        createRestWorkProgress(world, building, monsterId, workType, monsterPropertyComponent.baseProperty, hexPos);
    } else if (baseType == WorkBaseType.Synthetic) {
        createSyntheticWorkProgress(world, avatar, building, monsterId, workType, monsterPropertyComponent.baseProperty, hexPos);
    }
    return true;
}

function checkCanStartWork(avatar: Avatar, monster: Monster, building: Building, workType: WorkType): boolean {
    const workConfig = WorkInfoConfig.get(workType);
    const baseType = workIndex.get(workType);
    if (!workConfig) {
        log.info("工作配置不存在", workType);
        return false;
    }

    if (!monster.hasComponent("MonsterProperty")) {
        log.info("怪物没有MonsterProperty组件", monster.getId());
        return false;
    }

    const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
    if (monsterPropertyComponent.status != PalStatus.Idle) {
        log.info("怪物状态不是Idle", monster.getId());
        return false;
    }

    if (monsterPropertyComponent.baseProperty.level < workConfig.requiredLevel) {
        log.info("怪物等级不足", monster.getId());
        return false;
    }

    if (monsterPropertyComponent.workProperty.stamina < workConfig.stamminaCost) {
        log.info("怪物体力不足", monster.getId());
        return false;
    }

    const efficiency = getMonsterWorkEfficiency(monsterPropertyComponent.baseProperty.type, workType);
    if (efficiency === 0) {
        log.info("怪物工作效率为0", monster.getId());
        return false;
    }

    const property = building.getComponent("BuildingProperty") as BuildingPropertyComponent;

    if (baseType != WorkBaseType.Building) {
        if (!hasAvailableWorkSlot(building, workType)) {
            log.info("建筑没有空闲工作位", building.getId());
            return false;
        }

        if (property.getState() != BuildingState.Constructing) {
            log.info("建筑已建造", building.getId());
            return false;
        }
    } else {
        if (property.getState() != BuildingState.Constructed) {
            log.info("建筑未建造", building.getId());
            return false;
        }
    }

    if (baseType == WorkBaseType.Building) {
        if (!checkCanStartBuildingWork(avatar, monster, building, workType)) {
            log.info("建筑工作检查失败", building.getId(), workType);
            return false;
        }
    } else if (baseType == WorkBaseType.Production) {
        if (!checkCanStartProductionWork(avatar, monster, building, workType)) {
            log.info("生产工作检查失败", building.getId(), workType);
            return false;
        }
    } else if (baseType == WorkBaseType.Rest) {
        if (!checkCanStartRestWork(avatar, monster, building, workType)) {
            log.info("休息工作检查失败", building.getId(), workType);
            return false;
        }
    } else if (baseType == WorkBaseType.Synthetic) {
        if (!checkCanStartSyntheticWork(avatar, monster, building, workType)) {
            log.info("合成工作检查失败", building.getId(), workType);
            return false;
        }
    }
    return true;
}

export function processStopWork(world: World, avatarId: number, spaceId: number, monsterId: number, hexPos: HexCoord, isComplete: boolean = false): boolean {
    const space = world.getEntitiesManager().getEntity(spaceId) as RoomSpace;
    if (!space) {
        log.info("空间不存在", spaceId);
        return false;
    }

    const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
    if (!hexMapComponent) {
        log.info("空间不存在HexMap组件", spaceId);
        return false;
    }

    const hexTile = hexMapComponent.getHexAt(hexPos);
    if (!hexTile) {
        log.info("位置不存在HexTile", hexPos.q, hexPos.r);
        return false;
    }

    const buildingId = hexTile.entityId;
    if (buildingId == 0) {
        log.info("位置不存在建筑", hexPos.q, hexPos.r);
        return false;
    }

    const building = world.getEntitiesManager().getEntity(buildingId) as Building;
    if (!building) {
        log.info("建筑不存在", buildingId);
        return false;
    }

    const avatar = world.getEntitiesManager().getEntity(avatarId) as Avatar;
    if (!avatar) {
        log.info("avatar不存在", avatarId);
        return false;
    }

    const monster = world.getEntitiesManager().getEntity(monsterId) as Monster;
    if (!monster) {
        log.info("怪物不存在", monsterId);
        return false;
    }

    if (!monster.hasComponent("MonsterProperty")) {
        log.info("怪物没有MonsterProperty组件", monsterId);
        return false;
    }

    const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
    
    const workType = monsterPropertyComponent.workProperty.currentWorkType;
    const baseType = workIndex.get(workType);
    // todo: 抽象化
    if (isComplete) {
        let baseExp = 0;
        let costStamina = 0;
        let baseWorkConfig = null;;
        if (baseType == WorkBaseType.Production) {
            const workConfig = ProductionWorkConfig.get(workType);
            baseWorkConfig = workConfig;
        } else if (baseType == WorkBaseType.Building) {
            const workConfig = BuildingWorkConfig.get(workType);
            baseWorkConfig = workConfig;
        } else if (baseType == WorkBaseType.Rest) {
            const workConfig = RestWorkConfig.get(workType);
            baseWorkConfig = workConfig;
        } else if (baseType == WorkBaseType.Synthetic) {
            const workConfig = SyntheticWorkConfig.get(workType);
            baseWorkConfig = workConfig;
        }
        if (baseWorkConfig) {
            baseExp = Math.round(baseWorkConfig.baseTime / 10);
            costStamina = baseWorkConfig.stamminaCost;
        } else {
            log.info("工作配置不存在", workType);
            return false;
        }
        monsterPropertyComponent.onFinishWork(baseExp, costStamina);
    } else {
        if (baseType == WorkBaseType.Building) {
            processCancelBuildingWork(world, avatar, workType);
        } else if (baseType == WorkBaseType.Synthetic) {
            processCancelSyntheticWork(world, avatar, workType);
        }
    }

    if (baseType == WorkBaseType.Building) {
        const workProgress = building.getComponent("BuildingWorkProgress") as BuildingWorkProgressComponent;
        if (workProgress) {
            workProgress.removeWorkProgress(monsterId);
        }
    } else if (baseType == WorkBaseType.Production) {
        const workProgress = building.getComponent("ProductionWorkProgress") as ProductionWorkProgressComponent;
        if (workProgress) {
            workProgress.removeWorkProgress(monsterId);
        }
    } else if (baseType == WorkBaseType.Rest) {
        const workProgress = building.getComponent("RestWorkProgress") as RestWorkProgressComponent;
        if (workProgress) {
            workProgress.removeWorkProgress(monsterId);
        }
    } else if (baseType == WorkBaseType.Synthetic) {
        const workProgress = building.getComponent("SyntheticWorkProgress") as SyntheticWorkProgressComponent;
        if (workProgress) {
            workProgress.removeWorkProgress(monsterId);
        }
    }

    monsterPropertyComponent.stopWork();

    const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
    buildingPropertyComponent.removeWorkers(monsterId);

    return true;
}