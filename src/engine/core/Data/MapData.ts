import { Position } from "./common";
export class HexCoord {
    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }
    q: number;
    r: number;
}

export const HEX_DIRECTIONS: HexCoord[] = [
    new HexCoord(1, 0),   // 右
    new HexCoord(0, 1),   // 右下
    new HexCoord(-1, 1),  // 左下
    new HexCoord(-1, 0),  // 左
    new HexCoord(0, -1),  // 左上
    new HexCoord(1, -1)   // 右上
];

export class HexTile {
    coord: HexCoord;
    position: Position;
    entityId: number;
    canMove: boolean;
    
    constructor(coord: HexCoord, position: Position) {
        this.coord = coord;
        this.position = position;
        this.entityId = 0;
        this.canMove = true;
    }
}