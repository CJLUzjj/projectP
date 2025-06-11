import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent("MonsterList")
export class MonsterListComponent extends BaseComponent {
    monsterList: string[];
    
    constructor(owner: BaseEntity) {
        super(owner, "MonsterList");
        this.monsterList = [];
    }

    addMonster(monsterId: string) {
        this.monsterList.push(monsterId);
    }

    removeMonster(monsterId: string) {
        this.monsterList = this.monsterList.filter(id => id !== monsterId);
    }

    getMonsterList() {
        return this.monsterList;
    }
}


