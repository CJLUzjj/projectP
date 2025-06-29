import { MovementComponent } from "../../../Component/Basic/MovementComponent";
import { MonsterPropertyComponent } from "../../../Component/Property/MonsterPropertyComponent";
import { PalStatus } from "../../../Data/common";
import { Monster } from "../../../Entity/Monster";

export function stopMonsterMoving(monster: Monster) {
    const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
    if (monsterPropertyComponent.status != PalStatus.Moving) {
        return;
    }
    monsterPropertyComponent.status = PalStatus.Idle;
    monster.removeComponent("HexMapNavitation");
    const movementComponent = monster.getComponent("Movement") as MovementComponent;
    if (movementComponent) {
        movementComponent.setDirection({ x: 0, y: 0 });
    }
}


