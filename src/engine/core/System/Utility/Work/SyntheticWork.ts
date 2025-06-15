import { MonsterBaseProperty } from "../../../Data/MonsterData";
import { WorkType, BuildingWorkProgressData, SyntheticWorkProgressData } from "../../../Data/WorkData";
import { Building } from "../../../Entity/Building";
import { World } from "../../../Infra/World";
import { SyntheticWorkProgressComponent } from "../../../Component/Work/SyntheticWorkProgressComponent";
import { log } from "../../../Interface/Service/LogService";
import { BuildingPropertyComponent } from "../../../Component/Property/BuildingPropertyComponent";
import { calculateWorkTime } from "../Building/CreateBuilding";
import { Avatar } from "../../../Entity/Avatar";
import { Monster } from "../../../Entity/Monster";
import { SyntheticWorkConfig } from "../../../Data/config/work/SyntheticWork";
import { BackpackComponent } from "../../../Component/BackpackComponent";
import { Position } from "../../../Data/common";

export function createSyntheticWorkProgress(world: World, avatar: Avatar, building: Building, monsterId: number, workType: WorkType, monsterProperty: MonsterBaseProperty, position: Position): void {
    const workConfig = SyntheticWorkConfig.get(workType);
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
    if (building.hasComponent("SyntheticWorkProgress")) {
        workProgress = building.getComponent("SyntheticWorkProgress") as SyntheticWorkProgressComponent;
    } else {
        workProgress = building.addComponent("SyntheticWorkProgress") as SyntheticWorkProgressComponent;
    }
    if (!workProgress) {
        log.info("工作进度组件不存在", building.getId());
        return;
    }
    const progressData = workProgress.addWorkProgress(monsterId, workType, building.getId(), world.getCurrentVirtualTime(), position);
    if (!progressData) {
        log.info("工作进度不存在", building.getId());
        return;
    }
    const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
    progressData.endTime = progressData.startTime + calculateWorkTime(buildingPropertyComponent, monsterProperty, workType);
}

export function checkCanStartSyntheticWork(avatar: Avatar, monster: Monster, building: Building, workType: WorkType): boolean {
    const workConfig = SyntheticWorkConfig.get(workType);
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

export function processCancelSyntheticWork(world: World, avatar: Avatar, workType: WorkType): void {
    const workConfig = SyntheticWorkConfig.get(workType);
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

export function processFinishSyntheticWork(world: World, avatar: Avatar, building: Building, monsterId: number, workProgressData: SyntheticWorkProgressData): void {
    const workConfig = workProgressData.workConfig;
    const outputs = workConfig.outputs;
    const backpack = avatar.getComponent("Backpack") as BackpackComponent;
    if (!backpack) {
        log.info("背包组件不存在", avatar.getId());
        return;
    }
    for (const output of outputs) {
        const itemId = output.itemId;
        const quantity = output.quantity;
        backpack.getItemBackpack().addItemToBackpack(itemId, quantity);
    }
}
