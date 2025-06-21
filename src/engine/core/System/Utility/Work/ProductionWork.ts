import { ProductionWorkProgressComponent } from "../../../Component/Work/ProductionWorkProgressComponent";
import { MonsterBaseProperty } from "../../../Data/MonsterData";
import { BuildingWorkProgressData, ProductionWorkProgressData, WorkType } from "../../../Data/WorkData";
import { Building } from "../../../Entity/Building";
import { World } from "../../../Infra/World";
import { log } from "../../../Interface/Service/LogService";
import { BuildingPropertyComponent } from "../../../Component/Property/BuildingPropertyComponent";
import { calculateWorkTime } from "../Building/CreateBuilding";
import { Avatar } from "../../../Entity/Avatar";
import { Monster } from "../../../Entity/Monster";
import { BackpackComponent } from "../../../Component/BackpackComponent";
import { HexCoord } from "../../../Data/MapData";
export function createProductionWorkProgress(
    world: World, building: Building, monsterId: number, workType: WorkType, monsterProperty: MonsterBaseProperty, hexPos: HexCoord)
    : void {
        let workProgress = null
        if (building.hasComponent("ProductionWorkProgress")) {
            workProgress = building.getComponent("ProductionWorkProgress") as ProductionWorkProgressComponent;
        } else {
            workProgress = building.addComponent("ProductionWorkProgress") as ProductionWorkProgressComponent;
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

export function checkCanStartProductionWork(avatar: Avatar, monster: Monster, building: Building, workType: WorkType): boolean {
    return true;
}

export function processFinishProductionWork(world: World, avatar: Avatar, building: Building, monsterId: number, workProgressData: ProductionWorkProgressData): void {
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