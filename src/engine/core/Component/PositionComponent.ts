import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";
import { Position } from "../Data/common";
import { HexCoord } from "../Data/MapData";
import { pixelToHex } from "../Util/Position";
@RegisterComponent("Position")
export class PositionComponent extends BaseComponent {
    private pos: Position = { x: 0, y: 0 };
    private hexCoord: HexCoord = { q: 0, r: 0 };

    constructor(owner: BaseEntity) {
        super(owner, "Position");
    }

    setPosition(x: number, y: number, hexSize: number) {
        this.pos = { x, y };
        this.hexCoord = pixelToHex(this.pos, hexSize);
    }

    getPosition() {
        return this.pos;
    }
}