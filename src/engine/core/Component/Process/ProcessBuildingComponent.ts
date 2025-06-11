import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { BuildingType } from "../../Data/common";
interface BuildingAddRequest {
    avatarId: string;
    spaceId: string;
    buildingType: BuildingType;
}

interface BuildingRemoveRequest {
    avatarId: string;
    spaceId: string;
    buildingId: string;
}

@RegisterComponent("ProcessBuilding")
export class ProcessBuildingComponent extends BaseComponent {
    private addRequestList: BuildingAddRequest[];
    private removeRequestList: BuildingRemoveRequest[];

    constructor(owner: BaseEntity) {
        super(owner, "ProcessBuilding");
        this.addRequestList = [];
        this.removeRequestList = [];
    }

    addBuilding(avatarId: string, spaceId: string, buildingType: BuildingType) {
        this.addRequestList.push({ avatarId, spaceId, buildingType });
    }

    getAddRequestList() {
        return this.addRequestList;
    }

    clearAddRequestList() {
        this.addRequestList = [];
    }

    removeBuilding(avatarId: string, spaceId: string, buildingId: string) {
        this.removeRequestList.push({ avatarId, spaceId, buildingId });
    }

    getRemoveRequestList() {
        return this.removeRequestList;
    }

    clearRemoveRequestList() {
        this.removeRequestList = [];
    }
}
