import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";
import { Position } from "../Data/common";
import { HexCoord } from "../Data/MapData";
import { hexToPixel, pixelToHex } from "../Util/Position";
import { HEX_SIZE } from "../Data/constVal";
@RegisterComponent("Position")
export class PositionComponent extends BaseComponent {
    private pos: Position = { x: 0, y: 0 };
    private hexCoord: HexCoord = { q: 0, r: 0 };

    constructor(owner: BaseEntity) {
        super(owner, "Position");
    }

    getPosition() {
        return this.pos;
    }

    getHexCoord() {
        return this.hexCoord;
    }
    
    setHexCoord(q: number, r: number) {
        this.hexCoord = { q, r };
        this.pos = hexToPixel(this.hexCoord, HEX_SIZE);
    }
}