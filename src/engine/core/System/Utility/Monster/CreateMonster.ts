import { MonsterType } from "../../../Data/common";
import { MonsterPropertyComponent } from "../../../Component/Property/MonsterPropertyComponent";
import { BaseEntity } from "../../../Infra/Base/BaseEntity";

export function addDefaultMonster(monsterType: MonsterType, name: string, level: number, masterId: string): MonsterPropertyComponent {
    // 创建一个临时的Entity作为owner（这里应该使用实际的Monster实体）
    const tempOwner = {} as BaseEntity;
    return MonsterPropertyComponent.createMonsterPropertyDefault(
        tempOwner, 
        monsterType, 
        name, 
        level, 
        masterId
    );
}
