import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { WorkType } from "../../Data/WorkData";

@RegisterComponent("MonsterWork", "State", ["HexMapNavitation"])
export class MonsterWorkComponent extends BaseComponent {
    currentWorkType: WorkType;
    workStartTime: Date;
    assignedBuildingId: number;

    constructor(owner: BaseEntity, workType: WorkType, buildingId: number, time: number) {
        super(owner, "MonsterWork");
        this.currentWorkType = workType;
        this.workStartTime = new Date(time);
        this.assignedBuildingId = buildingId;
    }
}