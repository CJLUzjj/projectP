import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent("BuildingList")
export class BuildingListComponent extends BaseComponent {
    private buildingList: number[];

    constructor(owner: BaseEntity) {
        super(owner, "BuildingList");
        this.buildingList = []
    }

    addBuilding(buildingId: number) {
        this.buildingList.push(buildingId);
    }

    removeBuilding(buildingId: number) {
        this.buildingList = this.buildingList.filter(id => id !== buildingId);
    }

    getBuildingList() {
        return this.buildingList;
    }
}
