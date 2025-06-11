export class IdGenerator {
    private static instance: IdGenerator | null = null;
    private typeCounters: Map<string, number> = new Map();

    private constructor() {
        // 私有构造函数，确保单例
    }

    public static getInstance(): IdGenerator {
        if (!IdGenerator.instance) {
            IdGenerator.instance = new IdGenerator();
        }
        return IdGenerator.instance;
    }

    /**
     * 为指定类型生成唯一的自增ID
     * @param type 类型标识符
     * @returns 格式为 "type-数字" 的唯一ID
     */
    public generateId(type: string): string {
        // 获取当前类型的计数器，如果不存在则初始化为0
        const currentCount = this.typeCounters.get(type) || 0;
        const newCount = currentCount + 1;
        
        // 更新计数器
        this.typeCounters.set(type, newCount);
        
        // 返回格式化的ID
        return `${type}-${newCount}`;
    }

    /**
     * 静态便捷方法，直接生成ID
     * @param type 类型标识符
     * @returns 唯一ID
     */
    public static generateId(type: string): string {
        return IdGenerator.getInstance().generateId(type);
    }

    /**
     * 获取指定类型的当前计数值
     * @param type 类型标识符
     * @returns 当前计数值
     */
    public getCurrentCount(type: string): number {
        return this.typeCounters.get(type) || 0;
    }

    /**
     * 重置指定类型的计数器
     * @param type 类型标识符
     */
    public resetCounter(type: string): void {
        this.typeCounters.set(type, 0);
    }

    /**
     * 重置所有计数器
     */
    public resetAllCounters(): void {
        this.typeCounters.clear();
    }

    /**
     * 获取所有类型及其计数器状态
     * @returns 类型和计数器的映射
     */
    public getAllCounters(): Map<string, number> {
        return new Map(this.typeCounters);
    }
}

// 导出便捷的全局函数
export const generateId = (type: string): string => {
    return IdGenerator.generateId(type);
};

// 类型安全的ID生成器（可选，提供更好的类型检查）
export class TypedIdGenerator<T extends string> {
    constructor(private readonly typeName: T) {}

    public generateId(): string {
        return IdGenerator.generateId(this.typeName);
    }

    public getCurrentCount(): number {
        return IdGenerator.getInstance().getCurrentCount(this.typeName);
    }

    public resetCounter(): void {
        IdGenerator.getInstance().resetCounter(this.typeName);
    }
}

// 预定义的类型常量（可以根据项目需要扩展）
export const IdTypes = {
    MONSTER: 'monster',
    BUILDING: 'building',
    WORK: 'work',
    ITEM: 'item',
    AVATAR: 'avatar',
    SPACE: 'space',
    NODE_A: 'node_a',
    NODE_B: 'node_b',
    BACKPACK: 'backpack',
    ITEM_INDEX: 'item_index',
    TEST: 'test'
} as const;

// todo ID生成器也需要持久化
// 预定义的类型化ID生成器
export const MonsterIdGenerator = new TypedIdGenerator(IdTypes.MONSTER);
export const BuildingIdGenerator = new TypedIdGenerator(IdTypes.BUILDING);
export const WorkIdGenerator = new TypedIdGenerator(IdTypes.WORK);
export const ItemIdGenerator = new TypedIdGenerator(IdTypes.ITEM);
export const AvatarIdGenerator = new TypedIdGenerator(IdTypes.AVATAR);
export const SpaceIdGenerator = new TypedIdGenerator(IdTypes.SPACE);
export const BackpackIdGenerator = new TypedIdGenerator(IdTypes.BACKPACK);
export const ItemIndexIdGenerator = new TypedIdGenerator(IdTypes.ITEM_INDEX);
export const NodeAIdGenerator = new TypedIdGenerator(IdTypes.NODE_A);
export const NodeBIdGenerator = new TypedIdGenerator(IdTypes.NODE_B);
export const TestIdGenerator = new TypedIdGenerator(IdTypes.TEST);