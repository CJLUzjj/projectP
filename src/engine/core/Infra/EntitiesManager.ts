import { BaseEntity } from './Base/BaseEntity';
import { ComponentRegistry } from './ComponentRegistry';
import { World } from './World';
import { log } from '../Interface/Service/LogService';
import { globalPropertySyncService } from '../Interface/Service/PropertySyncService';

export class EntitiesManager {
    private entities: Map<number, BaseEntity>;
    private delayDestroyEntities: Map<number, BaseEntity>;
    private idGenerators: number;
    private world: World;


    constructor(world: World) {
        this.entities = new Map<number, BaseEntity>();
        this.delayDestroyEntities = new Map<number, BaseEntity>();
        this.idGenerators = 1;
        this.world = world;
    }

    public createEntity<T extends BaseEntity>(entityConstructor: new(world: World, id: number) => T): T {
        const entityId = this.idGenerators;
        const entity = new entityConstructor(this.world, entityId);
        this.idGenerators++;
        this.registerEntity(entity);
        this.world.getSyncQueue().updateAddEntity(entity);
        entity.init();
        return entity;
    }

    /**
     * 注册一个实体到管理器中
     * @param entity 要注册的实体
     */
    public registerEntity(entity: BaseEntity): void {
        // log.info("registerEntity", entity.getId());
        this.entities.set(entity.getId(), entity);
    }

    /**
     * 从管理器中移除一个实体
     * @param id 要移除的实体ID
     */
    public removeEntity(id: number): void {
        const entity = this.entities.get(id);
        if (!entity) {
            return;
        }
        this.world.getSyncQueue().updateRemoveEntity(entity);
        this.entities.delete(id);
    }

    /**
     * 通过ID获取实体
     * @param id 实体ID
     * @returns 找到的实体，如果不存在返回undefined
     */
    public getEntity<T extends BaseEntity>(id: number): T | undefined {
        if (this.delayDestroyEntities.has(id)) {
            return undefined;
        }
        const entity = this.entities.get(id);
        if (entity) {
            return entity as T;
        }
        return undefined;
    }

    /**
     * 获取所有已注册的实体
     * @returns 所有实体的数组
     */
    public getAllEntities(): BaseEntity[] {
        if (this.delayDestroyEntities.size > 0) {
            return Array.from(this.entities.values()).filter(entity => !this.delayDestroyEntities.has(entity.getId()));
        }
        return Array.from(this.entities.values());
    }

    /**
     * 通过多个Component名称获取同时拥有这些Component的Entity
     * @param componentNames Component名称数组
     * @returns Entity数组
     */
    public getEntitiesWithComponents(world: World, componentNames: string[]): BaseEntity[] {
        const entities = ComponentRegistry.getInstance().getEntitiesWithComponents(world, componentNames);
        if (this.delayDestroyEntities.size > 0) {
            return entities.filter(entity => !this.delayDestroyEntities.has(entity.getId()));
        }
        return entities;
    }

    /**
     * 清除所有实体
     */
    public clear(): void {
        this.entities.clear();
    }

    public addDelayDestroyEntity(entity: BaseEntity): void {
        this.delayDestroyEntities.set(entity.getId(), entity);
    }

    public tick(): void {
        for (const entity of this.delayDestroyEntities.values()) {
            this.removeEntity(entity.getId());
        }
        this.delayDestroyEntities.clear();
    }

    private createRawEntity(): BaseEntity {
        const entity = new BaseEntity(this.world, 0);
        return entity;
    }

    public serialize(): Record<string, any> {
        const serializationData = {
            idGenerators: this.idGenerators,
            entities: [] as Array<{id: number, data: Record<string, any>}>,
            delayDestroyEntities: [] as Array<{id: number, data: Record<string, any>}>,
        }
        for (const entity of this.entities.values()) {
            serializationData.entities.push({
                id: entity.getId(),
                data: entity.serialize(),
            });
        }
        for (const entity of this.delayDestroyEntities.values()) {
            serializationData.delayDestroyEntities.push({
                id: entity.getId(),
                data: entity.serialize(),
            });
        }
        return serializationData;
    }

    public deserialize(data: Record<string, any>) {
        try {
            const serializationData = data;
            this.idGenerators = serializationData.idGenerators;
            for (const entity of serializationData.entities) {
                const entityData = entity.data;
                const entityInstance = this.createRawEntity();
                if (entityInstance) {
                    entityInstance.deserialize(entityData);
                }
                this.registerEntity(entityInstance);
            }
            for (const entity of serializationData.delayDestroyEntities) {
                const entityData = entity.data;
                const entityInstance = this.createRawEntity();
                if (entityInstance) {
                    entityInstance.deserialize(entityData);
                }
                this.addDelayDestroyEntity(entityInstance);
            }
        } catch (error) {
            console.error('反序列化EntitiesManager时发生错误:', error);
            throw new Error(`反序列化失败: ${error}`);
        }
    }
} 