import { BuildingType } from "../../../Data/common";
import { World } from "../../../Infra/World";
import { log } from "../../../Interface/Service/LogService";
import { addDefaultBuilding } from "./CreateBuilding";
import { PositionComponent } from "../../../Component/PositionComponent";
import { Building } from "../../../Entity/Building";
import { BuildingPropertyComponent, BuildingState } from "../../../Component/Property/BuildingPropertyComponent";
import { BuildingListComponent } from "../../../Component/List/BuildingListComponent";
import { HexMapComponent } from "../../../Component/Map/HexMapComponent";
export function addBuilding(world: World, avatarId: number, spaceId: number,
    buildingType: BuildingType, q: number, r: number): Building | null {
    //todo 检查是否可以建造
    const space = world.getEntitiesManager().getEntity(spaceId);
    if (!space) {
        log.info("空间不存在", spaceId);
        return null;
    }

    const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
    if (!hexMapComponent) {
        log.info("空间不存在HexMap组件", spaceId);
        return null;
    }

    const hexTile = hexMapComponent.getHexAt({ q, r });
    if (!hexTile) {
        log.info("位置不存在HexTile", q, r);
        return null;
    }

    const building = world.getEntitiesManager().createEntity(Building);
    hexTile.entityId = building.getId();
    if (building.hasComponent("BuildingProperty") && building.hasComponent("Position")) {
        const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
        const buildingData = addDefaultBuilding(buildingType);
        buildingPropertyComponent.setData(buildingData);
        buildingPropertyComponent.setOwnerId(avatarId);
        buildingPropertyComponent.setState(BuildingState.Constructing);
        buildingPropertyComponent.setSpaceId(spaceId);

        const buildingPositionComponent = building.getComponent("Position") as PositionComponent;
        buildingPositionComponent.setHexCoord(q, r);
    }

    building.addComponent("Owner", avatarId);

    if (space.hasComponent("BuildingList")) {
        const buildingListComponent = space.getComponent("BuildingList") as BuildingListComponent;
        buildingListComponent.addBuilding(building.getId());
    }
    return building;
}
