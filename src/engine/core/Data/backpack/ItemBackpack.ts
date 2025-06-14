import { AbstractBackpack } from "./BackpackData";
import { BackpackItem } from "./BackpackData";
import { getItemById } from '../../Util/ItemUtils';
import { ItemData, ItemIndex } from "../ItemData";

// 产出背包类
export class ItemBackpack extends AbstractBackpack<ItemIndex> {
    constructor(maxCapacity: number = 100) {
        super(maxCapacity);
    }

    // todo: 新增通知机制，当物品发生变化时通知到表现层
    /**
     * 添加道具到库存
     */
    public addItemToBackpack(itemId: number, quantity: number): void {
        const itemIndex: ItemIndex = new ItemIndex(itemId);
        this.addItem(itemId.toString(), itemIndex, quantity);
    }

    public removeItemFromBackpack(itemId: number, quantity: number): boolean {
        return this.removeItem(itemId.toString(), quantity);
    }

    public hasItemInBackpack(itemId: number, quantity: number): boolean {
        const item = this.getItem(itemId.toString());
        if (!item) {
            return false;
        }
        if (item.quantity && item.quantity >= quantity) {
            return true;
        }
        return false;
    }

    /**
     * 获取显示列表
     */
    getDisplayList(): Array<{id: string, name: string, info: string}> {
        return this.getAllItems().map(item => {
            const itemData = getItemById(item.data.id);
            return {
                id: item.id,
                name: itemData?.name || item.id,
                info: `${item.quantity || 1}个`
            };
        });
    }

    /**
     * 获取背包总价值
     */
    getTotalValue(): number {
        return this.getAllItems().reduce((total, item) => {
            const itemData = getItemById(item.data.id);
            const value = itemData?.value || 0;
            const quantity = item.quantity || 1;
            return total + (value * quantity);
        }, 0);
    }
}
