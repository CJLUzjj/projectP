import { BuildingType, SpaceType } from "../../Data/common";
import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
export class RoomSpace extends BaseEntity {

    constructor(world: World, id: number = 0) {
        super(world, id);
    }

    init() {
        this.addComponent("RoomProperty");
        this.addComponent("ProcessBuilding");
        this.addComponent("BuildingList");
    }

    // public initializeDefaultBuildings(): void {
    //     this.buildingManager.addDefaultBuilding(BuildingType.Farm);
    //     this.buildingManager.addDefaultBuilding(BuildingType.Mine);
    //     this.buildingManager.addDefaultBuilding(BuildingType.Lumberyard);
    //     this.buildingManager.addDefaultBuilding(BuildingType.RestArea);
    // }

}