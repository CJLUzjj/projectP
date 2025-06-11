import { MonsterBaseProperty, MonsterWorkProperty, createMonsterBaseProperty, createMonsterWorkProperty } from "../../Data/MonsterData";
import { MonsterType, PalStatus } from "../../Data/common";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { WorkType } from "../../Data/WorkData";

@RegisterComponent('MonsterProperty')
export class MonsterPropertyComponent extends BaseComponent {
    status: PalStatus;
    masterId: string;
    baseProperty: MonsterBaseProperty;
    workProperty: MonsterWorkProperty;

    constructor(owner: BaseEntity) {
        super(owner, "MonsterProperty");
        this.status = PalStatus.Idle;
        this.masterId = "";
        this.baseProperty = new MonsterBaseProperty();
        this.workProperty = new MonsterWorkProperty();
    }

    static createMonsterPropertyDefault(owner: BaseEntity, type: MonsterType, name: string, level: number, masterId: string): MonsterPropertyComponent {
        let newProperty = new MonsterPropertyComponent(owner);
        newProperty.status = PalStatus.Idle
        newProperty.masterId =  masterId;
        newProperty.baseProperty = createMonsterBaseProperty(type, name, level);
        newProperty.workProperty = createMonsterWorkProperty(type, level);
        return newProperty;
    }

    startWork(workType: WorkType, buildingId: number, time: number) {
        this.status = PalStatus.Working;
        this.workProperty.currentWorkType = workType;
        this.workProperty.workStartTime = new Date(time);
        this.workProperty.assignedBuildingId = buildingId;
    }

    startRest(buildingId: number, time: number) {
        this.status = PalStatus.Resting;
        this.workProperty.workStartTime = new Date(time);
        this.workProperty.assignedBuildingId = buildingId;
    }

    stopWork() {
        this.status = PalStatus.Idle;
    }

    stopRest() {
        this.status = PalStatus.Idle;
    }

    onFinishWork(exp: number, stamina: number): void {
        // 更新怪物经验
        if (!this.workProperty.workExperience) {
            this.workProperty.workExperience = new Map();
        }
        const currentExp = this.workProperty.workExperience.get(this.workProperty.currentWorkType) || 0;
        this.workProperty.workExperience.set(this.workProperty.currentWorkType, currentExp + exp);

        this.workProperty.stamina = Math.max(0, this.workProperty.stamina - stamina);
    }

    updateStamina(stamina: number): void {
        this.workProperty.stamina = Math.min(this.workProperty.maxStamina, this.workProperty.stamina + stamina);
    }
}