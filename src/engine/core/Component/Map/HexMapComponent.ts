import { Position } from "../../Data/common";
import { HEX_DIRECTIONS, HexCoord, HexTile } from "../../Data/MapData";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { hexToPixel, pixelToHex } from "../../Util/Position";

@RegisterComponent("HexMap")
export class HexMapComponent extends BaseComponent {
    private hexSize: number;
    private hexMap: Map<string, HexTile>;
    private frontier: Set<string>;

    constructor(owner: BaseEntity, hexSize: number) {
        super(owner, "HexMap");
        this.hexSize = hexSize;
        this.hexMap = new Map();
        this.frontier = new Set();
    }

    resetMap(): void {
        this.hexMap.clear();
        this.frontier.clear();
        
        // 添加中心六边形
        const centerCoord = { q: 0, r: 0 };
        const centerPos = { x: 0, y: 0 }; // 逻辑位置，实际应用中会基于画布调整
        const centerHex = this.createHexTile(centerCoord, centerPos);
        
        this.hexMap.set(this.coordToKey(centerCoord), centerHex);
        
        // 将中心六边形的邻居添加到边界
        centerHex.neighbors.forEach(neighbor => {
            this.frontier.add(this.coordToKey(neighbor));
        });
    }

    createHexTile(coord: HexCoord, position: Position): HexTile {
        const hexTile = new HexTile(coord, position);
        hexTile.neighbors = this.calculateNeighbors(hexTile);
        return hexTile;
    }

    // 拓展地图（添加一个六边形）
    expandMap(): HexCoord | null {
        if (this.frontier.size === 0) return null;
        
        // 随机选择一个边界位置
        const keys = Array.from(this.frontier.keys());
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const coord = this.keyToCoord(randomKey);
        
        // 从边界中移除
        this.frontier.delete(randomKey);
        
        // 创建新六边形
        const position = hexToPixel(coord, this.hexSize);
        const newHex = this.createHexTile(coord, position);
        this.hexMap.set(randomKey, newHex);
        
        // 添加新邻居到边界
        newHex.neighbors.forEach(neighbor => {
            const neighborKey = this.coordToKey(neighbor);
            
            // 如果邻居不存在且不在边界中，则添加到边界
            if (!this.hexMap.has(neighborKey) && !this.frontier.has(neighborKey)) {
                this.frontier.add(neighborKey);
            }
        });
        
        return coord;
    }
    
    // 添加特定六边形
    addHexAt(coord: HexCoord): boolean {
        const key = this.coordToKey(coord);
        
        // 如果已存在，不添加
        if (this.hexMap.has(key)) return false;
        
        // 创建新六边形
        const position = hexToPixel(coord, this.hexSize);
        const newHex = new HexTile(coord, position);
        this.hexMap.set(key, newHex);
        
        // 从边界中移除（如果存在）
        this.frontier.delete(key);
        
        // 添加新邻居到边界
        newHex.neighbors.forEach(neighbor => {
            const neighborKey = this.coordToKey(neighbor);
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
    coordToKey(coord: HexCoord): string {
        return `${coord.q},${coord.r}`;
    }

    // 字符串键转坐标
    keyToCoord(key: string): HexCoord {
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
        const key = this.coordToKey(coord);
        return this.hexMap.get(key) || null;
    }

    getHexAtPosition(position: Position): HexTile | null {
        const hexCoord = pixelToHex(position, this.hexSize);
        return this.getHexAt(hexCoord);
    }

    getHexSize(): number {
        return this.hexSize;
    }
}