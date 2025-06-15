import { World } from "../../../Infra/World"
import { Building } from "../../../Entity/Building"
import { MonsterBaseProperty } from "../../../Data/MonsterData"
import { RestWorkProgressComponent } from "../../../Component/Work/RestWorkProgressComponent";
import { log } from "../../../Interface/Service/LogService";
import { BuildingPropertyComponent } from "../../../Component/Property/BuildingPropertyComponent";
import { calculateWorkTime } from "../Building/CreateBuilding";
import { WorkType, RestWorkProgressData } from "../../../Data/WorkData";
import { Avatar } from "../../../Entity/Avatar";
import { Monster } from "../../../Entity/Monster";
import { Position } from "../../../Data/common";

export function createRestWorkProgress(world: World, building: Building, monsterId: number, workType: WorkType, monsterProperty: MonsterBaseProperty, position: Position): void {
    let workProgress = null
    if (building.hasComponent("RestWorkProgress")) {
        workProgress = building.getComponent("RestWorkProgress") as RestWorkProgressComponent;
    } else {
        workProgress = building.addComponent("RestWorkProgress") as RestWorkProgressComponent;
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

export function checkCanStartRestWork(avatar: Avatar, monster: Monster, building: Building, workType: WorkType): boolean {
    return true;
}

export function processFinishRestWork(world: World, avatar: Avatar, building: Building, monsterId: number, workProgressData: RestWorkProgressData): void {
    
}