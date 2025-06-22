import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { Position } from "../../Data/common";
import { HexCoord } from "../../Data/MapData";
import { hexToPixel, pixelToHex } from "../../Util/Position";
import { HEX_SIZE } from "../../Data/constVal";
import { log } from "../../Interface/Service/LogService";

@RegisterComponent("Position")
export class PositionComponent extends BaseComponent {
    private pos: Position = { x: 0, y: 0 };
    private hexCoord: HexCoord = { q: 0, r: 0 };
    private tolerance: number = 10;

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

    setPosition(x: number, y: number) {
        this.pos = { x, y };
        // 只有当位置接近六边形中心点时才更新hex坐标
        if (this.isAtHexCenter()) {
            const oldHexCoord = this.hexCoord;
            this.hexCoord = pixelToHex(this.pos, HEX_SIZE);
            if (oldHexCoord.q != this.hexCoord.q || oldHexCoord.r != this.hexCoord.r) {
                log.info("PositionComponent setPosition", "hexCoord changed", oldHexCoord, this.hexCoord);
            }
        }
    }

    // 检查当前位置是否在六边形中心点
    isAtHexCenter(): boolean {
        // 根据当前xy坐标计算对应的六边形坐标
        const currentHexCoord = pixelToHex(this.pos, HEX_SIZE);
        // 根据计算出的六边形坐标获取中心点位置
        const expectedPos = hexToPixel(currentHexCoord, HEX_SIZE);
        
        const distance = Math.sqrt(
            Math.pow(this.pos.x - expectedPos.x, 2) + 
            Math.pow(this.pos.y - expectedPos.y, 2)
        );
        return distance <= this.tolerance;
    }

    // 获取到六边形中心点的距离
    getDistanceToHexCenter(): number {
        // 根据当前xy坐标计算对应的六边形坐标
        const currentHexCoord = pixelToHex(this.pos, HEX_SIZE);
        // 根据计算出的六边形坐标获取中心点位置
        const expectedPos = hexToPixel(currentHexCoord, HEX_SIZE);
        
        return Math.sqrt(
            Math.pow(this.pos.x - expectedPos.x, 2) + 
            Math.pow(this.pos.y - expectedPos.y, 2)
        );
    }

    // 强制更新hex坐标（用于初始化或特殊情况）
    forceUpdateHexCoord(): void {
        this.hexCoord = pixelToHex(this.pos, HEX_SIZE);
    }

    // 设置容差
    setTolerance(tolerance: number): void {
        this.tolerance = tolerance;
    }

    // 获取容差
    getTolerance(): number {
        return this.tolerance;
    }
}