import { BuildingWorkProgressComponent } from "../../../Component/Work/BuildingWorkProgressComponent";
import { MonsterBaseProperty } from "../../../Data/MonsterData";
import { BuildingWorkProgressData, WorkType } from "../../../Data/WorkData";
import { Building } from "../../../Entity/Building";
import { World } from "../../../Infra/World";
import { log } from "../../../Interface/Service/LogService";
import { BuildingPropertyComponent, BuildingState } from "../../../Component/Property/BuildingPropertyComponent";
import { calculateWorkTime } from "../Building/CreateBuilding";
import { Avatar } from "../../../Entity/Avatar";
import { Monster } from "../../../Entity/Monster";
import { BuildingWorkConfig } from "../../../Data/config/work/BuildingWork";
import { BackpackComponent } from "../../../Component/Basic/BackpackComponent";
import { BuildingType, Position } from "../../../Data/common";
import { SpaceComponent } from "../../../Component/Basic/SpaceComponent";
import { addBuilding } from "../Building/Common";
import { HexCoord } from "../../../Data/MapData";

export function createBuildingWorkProgress(world: World, avatar: Avatar, building: Building, monsterId: number, workType: WorkType, monsterProperty: MonsterBaseProperty, hexPos: HexCoord): void {
    const workConfig = BuildingWorkConfig.get(workType);
    if (!workConfig) {
        log.info("工作配置不存在", workType);
        return;
    }

    const items = workConfig.inputs;
    const backpack = avatar.getComponent("Backpack") as BackpackComponent;
    if (!backpack) {
        log.info("背包组件不存在", avatar.getId());
        return;
    }
    for (const item of items) {
        const itemId = item.itemId;
        const quantity = item.quantity;
        if (!backpack.getItemBackpack().removeItemFromBackpack(itemId, quantity)) {
            log.info("背包物品不足", avatar.getId(), itemId, quantity);
            return;
        }
    }
    let workProgress = null
    if (building.hasComponent("BuildingWorkProgress")) {
        workProgress = building.getComponent("BuildingWorkProgress") as BuildingWorkProgressComponent;
    } else {
        workProgress = building.addComponent("BuildingWorkProgress") as BuildingWorkProgressComponent;
    }
    if (!workProgress) {
        log.info("工作进度组件不存在", building.getId());
        return;
    }
    const progressData = workProgress.addWorkProgress(monsterId, workType, building.getId(), world.getCurrentVirtualTime(), hexPos);
    if (!progressData) {
        log.info("工作进度不存在", building.getId());
        return;
    }
    const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
    progressData.endTime = progressData.startTime + calculateWorkTime(buildingPropertyComponent, monsterProperty, workType);
}

export function checkCanStartBuildingWork(avatar: Avatar, monster: Monster, building: Building, workType: WorkType): boolean {
    const workConfig = BuildingWorkConfig.get(workType);
    if (!workConfig) {
        log.info("工作配置不存在", workType);
        return false;
    }

    const items = workConfig.inputs;
    const backpack = avatar.getComponent("Backpack") as BackpackComponent;
    if (!backpack) {
        log.info("背包组件不存在", avatar.getId());
        return false;
    }
    for (const item of items) {
        const itemId = item.itemId;
        const quantity = item.quantity;
        if (!backpack.getItemBackpack().hasItemInBackpack(itemId, quantity)) {
            log.info("背包物品不足", avatar.getId(), itemId, quantity);
            return false;
        }
    }
    return true;
}

export function processCancelBuildingWork(world: World, avatar: Avatar, workType: WorkType): void {
    const workConfig = BuildingWorkConfig.get(workType);
    if (!workConfig) {
        log.info("工作配置不存在", workType);
        return;
    }

    const items = workConfig.inputs;
    const backpack = avatar.getComponent("Backpack") as BackpackComponent;
    if (!backpack) {
        log.info("背包组件不存在", avatar.getId());
        return;
    }
    for (const item of items) {
        const itemId = item.itemId;
        const quantity = item.quantity;
        backpack.getItemBackpack().addItemToBackpack(itemId, quantity)
    }
}

export function processFinishBuildingWork(world: World, avatar: Avatar, building: Building, monsterId: number, workProgressData: BuildingWorkProgressData): void {
    const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
    if (!buildingPropertyComponent) {
        log.info("建筑属性组件不存在", building.getId());
        return;
    }
    buildingPropertyComponent.setState(BuildingState.Constructed);
}

export function tryCreateBuildingForWork(world: World, avatar: Avatar, buildingType: BuildingType, hexPos: HexCoord): Building | null {
    // todo:检查position是否可以建造
    
    const spaceComponent = avatar.getComponent("Space") as SpaceComponent;
    if (!spaceComponent) {
        log.info("空间组件不存在", avatar.getId());
        return null;
    }
    const spaceId = spaceComponent.getSpaceId();
    const building = addBuilding(world, avatar.getId(), spaceId, buildingType, hexPos.q, hexPos.r);
    if (!building) {
        log.info("建筑创建失败", avatar.getId(), buildingType, hexPos.q, hexPos.r);
        return null;
    }
    return building;
}