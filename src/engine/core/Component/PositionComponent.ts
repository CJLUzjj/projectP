import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";
import { Position } from "../Data/common";

@RegisterComponent("Position")
export class PositionComponent extends BaseComponent {
    private pos: Position = { x: 0, y: 0 };

    constructor(owner: BaseEntity) {
        super(owner, "Position");
    }

    setPosition(x: number, y: number) {
        this.pos = { x, y };
    }

    getPosition() {
        return this.pos;
    }
}