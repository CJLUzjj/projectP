import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { BuildingData } from "../../Data/BuildingData";

export enum BuildingState {
    Init,
    Constructing,
    Constructed,
    Destroyed,
}

@RegisterComponent("BuildingProperty")
export class BuildingPropertyComponent extends BaseComponent {
    data: BuildingData | null;
    state: BuildingState;
    ownerId: number;
    spaceId: number;

    constructor(owner: BaseEntity) {
        super(owner, "BuildingProperty");
        this.data = null;
        this.ownerId = 0;
        this.state = BuildingState.Init;
        this.spaceId = 0;
    }

    setData(data: BuildingData) {
        this.data = data;
    }

    getData(): BuildingData | null {
        return this.data;
    }

    setOwnerId(ownerId: number) {
        this.ownerId = ownerId;
    }

    getOwnerId(): number {
        return this.ownerId;
    }

    setSpaceId(spaceId: number) {
        this.spaceId = spaceId;
    }

    getSpaceId(): number {
        return this.spaceId;
    }

    getState(): BuildingState {
        return this.state;
    }

    setState(state: BuildingState) {
        this.state = state;
    }

    addWorkers(monsterId: number) {
        if (!this.data) {
            return;
        }
        this.data.workerList.push(monsterId);
        this.data.currentWorkers++;
    }

    removeWorkers(monsterId: number) {
        if (!this.data) {
            return;
        }
        this.data.workerList = this.data.workerList.filter((id) => id !== monsterId);
        this.data.currentWorkers--;
    }
}


