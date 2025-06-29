import { BaseEntity } from "../Infra/Base/BaseEntity";
import { World } from "../Infra/World";
export class Monster extends BaseEntity {

    constructor(world: World, id: number = 0) {
        super(world, id);
    }

    init() {
        this.addComponent("MonsterProperty");
        this.addComponent("Position");
        this.addComponent("RandomWalk");
    }

    // static createDefaultMonster(type: MonsterType, name: string, level: number, masterId: string): Monster {
    //     const monster = new Monster(true);
    //     monster.monsterPropertyComponent = MonsterPropertyComponent.createMonsterPropertyDefault(monster, type, name, level, masterId);
    //     return monster;
    // }

    // updateMonsterWorkProperty(workStartTime?: Date, currentWorkType?: WorkType,
    //     assignedBuildingId?: string): void {
    //     this.monsterPropertyComponent.workProperty.workStartTime = workStartTime || new Date();
    //     this.monsterPropertyComponent.workProperty.currentWorkType = currentWorkType || WorkType.None;
    //     this.monsterPropertyComponent.workProperty.assignedBuildingId = assignedBuildingId || '';
    // }
    
    // updateMonsterStatus(status: PalStatus): void {
    //     this.monsterPropertyComponent.status = status;
    // }

    // onFinishWork(workType: WorkType, exp: number, stamina: number): void {
    //     // 更新怪物经验
    //     if (!this.monsterPropertyComponent.workProperty.workExperience) {
    //         this.monsterPropertyComponent.workProperty.workExperience = new Map();
    //     }
    //     const currentExp = this.monsterPropertyComponent.workProperty.workExperience.get(workType) || 0;
    //     this.monsterPropertyComponent.workProperty.workExperience.set(workType, currentExp + exp);

    //     this.monsterPropertyComponent.workProperty.stamina = Math.max(0, this.monsterPropertyComponent.workProperty.stamina - stamina);
    // }

    // onFinishRest(stamina: number): void {
    //     this.monsterPropertyComponent.workProperty.stamina = Math.min(this.monsterPropertyComponent.workProperty.maxStamina, this.monsterPropertyComponent.workProperty.stamina - stamina);
    // }
}