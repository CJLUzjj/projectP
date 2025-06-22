import { Position } from "../../Data/common";
import { HEX_DIRECTIONS, HexCoord, HexTile } from "../../Data/MapData";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { hexToPixel, pixelToHex } from "../../Util/Position";
import { log } from "../../Interface/Service/LogService";
import { HEX_SIZE } from "../../Data/constVal";

@RegisterComponent("HexMap")
export class HexMapComponent extends BaseComponent {
    private hexSize: number;
    private hexMap: Map<string, HexTile>;
    private frontier: Set<string>;

    constructor(owner: BaseEntity) {
        super(owner, "HexMap");
        this.hexSize = HEX_SIZE;
        this.hexMap = new Map();
        this.frontier = new Set();
        this.resetMap();
        this.expandMapLevel(5);
    }

    resetMap(): void {
        this.hexMap.clear();
        this.frontier.clear();
        
        // 添加中心六边形
        const centerCoord = { q: 0, r: 0 };
        const centerPos = { x: 0, y: 0 }; // 逻辑位置，实际应用中会基于画布调整
        const centerHex = new HexTile(centerCoord, centerPos);
        
        this.hexMap.set(HexMapComponent.coordToKey(centerCoord), centerHex);
        
        const neighbors = this.calculateNeighbors(centerHex);
        neighbors.forEach(neighbor => {
            this.frontier.add(HexMapComponent.coordToKey(neighbor));
        });
        log.info("地图初始化完成", this.hexMap.size);
    }

    // 拓展地图（添加一个六边形）
    expandMap(key: string): HexCoord | null {
        if (this.frontier.size === 0) return null;
        
        // 随机选择一个边界位置
        const keys = Array.from(this.frontier.keys());
        let chooseKey = "";
        if (keys.length === 0) {
            chooseKey = keys[Math.floor(Math.random() * keys.length)];
        } else {
            chooseKey = key;
        }
        const coord = HexMapComponent.keyToCoord(chooseKey);
        
        // 从边界中移除
        this.frontier.delete(chooseKey);
        
        // 创建新六边形
        const position = hexToPixel(coord, this.hexSize);
        const newHex = new HexTile(coord, position);
        this.hexMap.set(chooseKey, newHex);
        
        const neighbors = this.calculateNeighbors(newHex);
        // 添加新邻居到边界
        neighbors.forEach(neighbor => {
            const neighborKey = HexMapComponent.coordToKey(neighbor);
            
            // 如果邻居不存在且不在边界中，则添加到边界
            if (!this.hexMap.has(neighborKey) && !this.frontier.has(neighborKey)) {
                this.frontier.add(neighborKey);
            }
        });
        
        return coord;
    }

    expandMapLevel(level: number): void {
        if (this.frontier.size === 0) return;
        for (let i = 0; i < level; i++) {
            const currentFrontier = new Set(this.frontier);
            for (const key of currentFrontier) {
                this.expandMap(key);
            }
        }

        log.info("地图扩展完成", this.hexMap.size);
    }
    
    // 添加特定六边形
    addHexAt(coord: HexCoord): boolean {
        const key = HexMapComponent.coordToKey(coord);
        
        // 如果已存在，不添加
        if (this.hexMap.has(key)) return false;
        
        // 创建新六边形
        const position = hexToPixel(coord, this.hexSize);
        const newHex = new HexTile(coord, position);
        this.hexMap.set(key, newHex);
        
        // 从边界中移除（如果存在）
        this.frontier.delete(key);
        
        const neighbors = this.calculateNeighbors(newHex);
        // 添加新邻居到边界
        neighbors.forEach(neighbor => {
            const neighborKey = HexMapComponent.coordToKey(neighbor);
            if (!this.hexMap.has(neighborKey) && !this.frontier.has(neighborKey)) {
                this.frontier.add(neighborKey);
            }
        });
        
        return true;
    }
        
    // 计算六边形的所有邻居坐标
    calculateNeighbors(hexTile: HexTile): HexCoord[] {
        return HEX_DIRECTIONS.map(dir => ({
            q: hexTile.coord.q + dir.q,
            r: hexTile.coord.r + dir.r
        }));
    }

    // 坐标转字符串键
    static coordToKey(coord: HexCoord): string {
        return `${coord.q},${coord.r}`;
    }

    // 字符串键转坐标
    static keyToCoord(key: string): HexCoord {
        const [q, r] = key.split(',').map(Number);
        return { q, r };
    }

    // 获取六边形数量
    getHexCount(): number {
        return this.hexMap.size;
    }
    
    // 获取边界数量
    getFrontierCount(): number {
        return this.frontier.size;
    }
    
    // 获取特定坐标的六边形
    getHexAt(coord: HexCoord): HexTile | null {
        const key = HexMapComponent.coordToKey(coord);
        return this.hexMap.get(key) || null;
    }

    getHexAtPosition(position: Position): HexTile | null {
        const hexCoord = pixelToHex(position, this.hexSize);
        return this.getHexAt(hexCoord);
    }

    getHexSize(): number {
        return this.hexSize;
    }

    getHexMap(): Map<string, HexTile> {
        return this.hexMap;
    }

    canMove(coord: HexCoord): boolean {
        const hexTile = this.getHexAt(coord);
        if (hexTile == null) {
            return false;
        }
        return hexTile.canMove;
    }
}