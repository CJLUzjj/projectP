import { ItemsConfig } from "../Data/config/ItemsConfig";
import { ItemData } from "../Data/ItemData";
import { ItemType } from "../Data/common";

// 根据ID获取道具数据
export function getItemById(id: number): ItemData | undefined {
    return ItemsConfig.get(id);
}

// 根据类型获取道具列表
export function getItemsByType(type: ItemType): ItemData[] {
    return Array.from(ItemsConfig.values()).filter(item => item.type === type);
}