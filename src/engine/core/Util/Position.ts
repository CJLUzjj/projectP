import { HexCoord } from "../Data/MapData";
import { Position } from "../Data/common";

// 六边形坐标转世界坐标
export function hexToPixel(coord: HexCoord, hexSize: number): Position {
    const x = hexSize * (Math.sqrt(3) * coord.q + Math.sqrt(3)/2 * coord.r);
    const y = hexSize * (3/2 * coord.r);
    return { x, y };
}

// 世界坐标转六边形坐标
export function pixelToHex(point: Position, hexSize: number): HexCoord {
    const q = (point.x * Math.sqrt(3)/3 - point.y / 3) / hexSize;
    const r = (point.y * 2/3) / hexSize;
    
    return roundHex({ q, r });
}

// 六边形坐标取整
export function roundHex(frac: HexCoord): HexCoord {
    let q = Math.round(frac.q);
    let r = Math.round(frac.r);
    const s = Math.round(-frac.q - frac.r);
    
    const qDiff = Math.abs(q - frac.q);
    const rDiff = Math.abs(r - frac.r);
    const sDiff = Math.abs(s - (-frac.q - frac.r));
    
    if (qDiff > rDiff && qDiff > sDiff) {
        q = -r - s;
    } else if (rDiff > sDiff) {
        r = -q - s;
    }
    
    return { q, r };
}