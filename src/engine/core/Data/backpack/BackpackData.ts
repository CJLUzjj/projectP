import { BackpackIdGenerator, ItemIndexIdGenerator } from "../../Util/IdGenerator";

// 背包项目接口
export class BackpackItem<T> {
    constructor(id: string, itemId: string, data: T, quantity: number = 1) {
        this.id = id;
        this.itemId = itemId;
        this.data = data;
        this.quantity = quantity;
    }

    id: string;
    itemId: string;
    quantity?: number; // 可选，用于可堆叠物品
    data: T;

    getId(): string {
        return this.id;
    }
}

// 抽象背包基类
export abstract class AbstractBackpack<T> {
    protected items: Map<string, BackpackItem<T>> = new Map();
    protected maxCapacity: number;
    protected unique: boolean; // 道具是否唯一
    protected id: string;

    constructor(maxCapacity: number = Infinity, unique: boolean = false) {
        this.id = BackpackIdGenerator.generateId();
        this.maxCapacity = maxCapacity;
        this.unique = unique;
    }

    getId(): string {
        return this.id;
    }

    /**
     * 添加物品到背包
     */
    addItem(id: string, item: T, count: number = 1): boolean {
        // 检查容量限制
        if (this.items.size >= this.maxCapacity) {
            if (this.unique || !this.items.has(id)) {
                return false;
            }
        }

        const existingItem = this.items.get(id);
        if (existingItem) {
            if (this.unique) {
                return false;
            }
            existingItem.quantity = (existingItem.quantity || 0) + count;
            return true;
        } else {
            // 添加新物品
            const uniId = ItemIndexIdGenerator.generateId();
            this.items.set(id + '_' + uniId, new BackpackItem(id + '_' + uniId, id, item, count));
            return true;
        }
    }

    /**
     * 从背包移除物品
     */
    removeItem(itemId: string, count: number = 1): boolean {   
        const item = this.items.get(itemId);
        if (item) {
            if (item.quantity && item.quantity >= count) {
                item.quantity -= count;
                if (item.quantity === 0) {
                    this.items.delete(itemId);
                }
                return true;
            }
            return false;
        }
        return false;
    }

    /**
     * 获取特定物品
     */
    getItem(itemId: string): BackpackItem<T> | undefined {
        return this.items.get(itemId);
    }

    getItemData(itemId: string): T | undefined {
        return this.items.get(itemId)?.data;
    }

    /**
     * 获取特定物品数量
     */
    getItemQuantity(itemId: string): number {
        return this.items.get(itemId)?.quantity || 0;
    }

    /**
     * 获取所有物品
     */
    getAllItems(): BackpackItem<T>[] {
        return Array.from(this.items.values());
    }

    getAllItemsData(): T[] {
        return this.getAllItems().map(item => item.data);
    }

    /**
     * 检查是否包含特定物品
     */
    hasItem(itemId: string): boolean {
        return this.items.has(itemId);
    }

    /**
     * 获取背包使用的容量
     */
    getUsedCapacity(): number {
        return this.items.size;
    }

    /**
     * 获取背包剩余容量
     */
    getRemainingCapacity(): number {
        return this.maxCapacity - this.items.size;
    }

    /**
     * 获取背包最大容量
     */
    getMaxCapacity(): number {
        return this.maxCapacity;
    }

    /**
     * 设置背包最大容量
     */
    setMaxCapacity(capacity: number): void {
        this.maxCapacity = capacity;
    }

    /**
     * 清空背包
     */
    clear(): void {
        this.items.clear();
    }

    /**
     * 获取背包大小
     */
    size(): number {
        return this.items.size;
    }

    /**
     * 背包是否为空
     */
    isEmpty(): boolean {
        return this.items.size === 0;
    }

    /**
     * 背包是否已满
     */
    isFull(): boolean {
        return this.items.size >= this.maxCapacity;
    }

    /**
     * 获取物品列表（用于显示）
     */
    abstract getDisplayList(): Array<{id: string, name: string, info: string}>;
}