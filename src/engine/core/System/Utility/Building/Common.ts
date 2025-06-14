import { BuildingType } from "../../../Data/common";
import { World } from "../../../Infra/World";
import { log } from "../../../Interface/Service/LogService";
import { addDefaultBuilding } from "./CreateBuilding";
import { PositionComponent } from "../../../Component/PositionComponent";
import { Building } from "../../../Entity/Building";
import { BuildingPropertyComponent, BuildingState } from "../../../Component/Property/BuildingPropertyComponent";
import { BuildingListComponent } from "../../../Component/List/BuildingListComponent";
export function addBuilding(world: World, avatarId: number, spaceId: number,
    buildingType: BuildingType, x: number, y: number): Building | null {
    //todo 检查是否可以建造

    const building = world.getEntitiesManager().createEntity(Building);
    if (building.hasComponent("BuildingProperty") && building.hasComponent("Position")) {
        const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
        const buildingData = addDefaultBuilding(buildingType);
        buildingPropertyComponent.setData(buildingData);
        buildingPropertyComponent.setOwnerId(avatarId);
        buildingPropertyComponent.setState(BuildingState.Constructing);

        const buildingPositionComponent = building.getComponent("Position") as PositionComponent;
        buildingPositionComponent.setPosition(x, y);
    }

    building.addComponent("Owner", avatarId);

    const space = world.getEntitiesManager().getEntity(spaceId);
    if (!space) {
        log.info("空间不存在", spaceId);
        return null;
    }
    if (space.hasComponent("BuildingList")) {
        const buildingListComponent = space.getComponent("BuildingList") as BuildingListComponent;
        buildingListComponent.addBuilding(building.getId());
    }
    return building;
}
