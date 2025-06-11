import { createObserver, globalPropertySyncService } from '../Interface/Service/PropertySyncService';
import { BaseComponent } from './Base/BaseComponent';
import { BaseEntity } from './Base/BaseEntity';
import { EntitiesManager } from './EntitiesManager';
import { World } from './World';
import { log } from '../Interface/Service/LogService';
// Component构造函数类型
type ComponentConstructor<T extends BaseComponent = BaseComponent> = new (owner: BaseEntity, ...args: any[]) => T;

// Component工厂函数类型
type ComponentFactory<T extends BaseComponent = BaseComponent> = (owner: BaseEntity, ...args: any[]) => T;

/**
 * Component注册器装饰器
 * 用于注册Component类
 */
export function RegisterComponent(name: string) {
    return function <T extends ComponentConstructor>(constructor: T) {
        ComponentRegistry.getInstance().registerComponent(name, constructor);
        return constructor;
    };
}

export function RegisterSingletonComponent(name: string) {
    return function <T extends ComponentConstructor>(constructor: T) {
        ComponentRegistry.getInstance().registerSingletonComponent(name, constructor);
        return constructor;
    };
}

/**
 * Component反射注册表
 * 管理所有Component的创建和查询
 * 
 * Component的生命周期由Entity来管理，ComponentRegistry只负责Component的创建和索引维护
 * 禁止除EntityManager和BaseEntity外的其他类调用ComponentRegistry的方法
 */
export class ComponentRegistry {
    private static instance: ComponentRegistry;
    private componentConstructors: Map<string, ComponentConstructor> = new Map();
    private componentFactories: Map<string, ComponentFactory> = new Map();
    // 维护Entity到Component的映射，用于快速查询
    private entityComponents: Map<number, Set<string>> = new Map();
    // 维护Component到Entity的映射，用于快速查询
    private componentEntities: Map<string, Set<number>> = new Map();
    // 单例Component集合 - 记录哪些Component是单例的
    private singletonComponents: Set<string> = new Set();
    // 全局单例Component实例缓存 - componentName -> component instance
    private globalSingletonInstances: Map<string, BaseComponent> = new Map();

    private constructor() {}

    public static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }

    /**
     * 注册Component构造函数
     * @param name Component名称
     * @param constructor Component构造函数
     */
    public registerComponent<T extends BaseComponent>(
        name: string, 
        constructor: ComponentConstructor<T>
    ): void {
        this.componentConstructors.set(name, constructor);
    }

    /**
     * 注册单例Component构造函数（全局唯一，进程永久存在）
     * @param name Component名称
     * @param constructor Component构造函数
     */
    public registerSingletonComponent<T extends BaseComponent>(
        name: string, 
        constructor: ComponentConstructor<T>
    ): void {
        this.componentConstructors.set(name, constructor);
        this.singletonComponents.add(name);
    }

    /**
     * 注册Component工厂函数
     * @param name Component名称
     * @param factory Component工厂函数
     */
    public registerComponentFactory<T extends BaseComponent>(
        name: string, 
        factory: ComponentFactory<T>
    ): void {
        this.componentFactories.set(name, factory);
    }

    /**
     * 通过名称创建Component实例（普通Component）
     * @param name Component名称
     * @param owner 拥有此Component的Entity
     * @param args 构造参数
     * @returns Component实例
     */
    public createComponent<T extends BaseComponent>(
        name: string, 
        owner: BaseEntity, 
        ...args: any[]
    ): T | null {
        // 单例Component不能通过createComponent创建
        if (this.singletonComponents.has(name)) {
            console.error(`单例Component "${name}" 不能通过createComponent创建，请使用getSingletonComponent`);
            return null;
        }

        let component: T | null = null;

        // 优先使用工厂函数
        const factory = this.componentFactories.get(name);
        if (factory) {
            component = factory(owner, ...args) as T;
        } else {
            // 使用构造函数
            const constructor = this.componentConstructors.get(name);
            if (constructor) {
                component = new constructor(owner, ...args) as T;
            }
        }

        if (component) {
            if (globalPropertySyncService) {
                component = createObserver(component, globalPropertySyncService.onSyncComponent);
                globalPropertySyncService.onAddComponent(component);
            }
            this.addComponentToEntity(owner.getId(), name, component);
            return component;
        }

        console.warn(`Component "${name}" 未注册`);
        return null;
    }

    /**
     * 获取全局单例Component（懒加载，第一次调用时创建）
     * @param name Component名称
     * @param dummyOwner 虚拟owner（单例Component不需要真正的owner）
     * @param args 构造参数（仅在第一次创建时使用）
     * @returns 单例Component实例
     */
    public getSingletonComponent<T extends BaseComponent>(
        name: string,
        dummyOwner?: BaseEntity,
        ...args: any[]
    ): T | null {
        if (!this.singletonComponents.has(name)) {
            console.error(`"${name}" 不是已注册的单例Component`);
            return null;
        }

        // 如果已存在，直接返回
        const existingInstance = this.globalSingletonInstances.get(name);
        if (existingInstance) {
            return existingInstance as T;
        }
        
        // 创建虚拟Entity作为owner（如果没有提供）
        const owner = dummyOwner || this.createDummyEntity();
        
        let component: T | null = null;

        // 优先使用工厂函数
        const factory = this.componentFactories.get(name);
        if (factory) {
            component = factory(owner, ...args) as T;
        } else {
            // 使用构造函数
            const constructor = this.componentConstructors.get(name);
            if (constructor) {
                component = new constructor(owner, ...args) as T;
            }
        }

        if (component) {
            // 缓存全局单例实例
            this.globalSingletonInstances.set(name, component);
            return component;
        }

        console.error(`创建单例Component "${name}" 失败`);
        return null;
    }

    /**
     * 创建虚拟Entity作为单例Component的owner
     */
    private createDummyEntity(): BaseEntity {
        // 这里需要创建一个虚拟的Entity，具体实现取决于你的BaseEntity构造函数
        // 假设BaseEntity有一个简单的构造函数
        class DummyEntity extends BaseEntity {
            constructor(world: World, id: number = 0) {
                super(world, id);
            }
        }
        return World.getDefaultWorld().getEntitiesManager().createEntity(DummyEntity);
    }

    /**
     * 检查Component是否已注册
     * @param name Component名称
     * @returns 是否已注册
     */
    public hasComponent(name: string): boolean {
        return this.componentConstructors.has(name) || this.componentFactories.has(name);
    }

    /**
     * 检查Component是否是单例类型
     * @param name Component名称
     * @returns 是否是单例
     */
    public isSingletonComponent(name: string): boolean {
        return this.singletonComponents.has(name);
    }

    /**
     * 获取所有已注册的Component名称
     * @returns Component名称数组
     */
    public getAllComponentNames(): string[] {
        const names = new Set<string>();
        this.componentConstructors.forEach((_, name) => names.add(name));
        this.componentFactories.forEach((_, name) => names.add(name));
        return Array.from(names);
    }

    /**
     * 将Component添加到Entity的映射中
     * @param entityId Entity ID
     * @param componentName Component名称
     * @param componentInstance Component实例
     */
    private addComponentToEntity(entityId: number, componentName: string, componentInstance: BaseComponent): void {
        // 更新Entity到Component的映射
        if (!this.entityComponents.has(entityId)) {
            this.entityComponents.set(entityId, new Set());
        }
        this.entityComponents.get(entityId)!.add(componentName);

        // 更新Component到Entity的映射
        if (!this.componentEntities.has(componentName)) {
            this.componentEntities.set(componentName, new Set());
        }
        this.componentEntities.get(componentName)!.add(entityId);
    }

    /**
     * 从Entity的映射中移除Component
     * @param entityId Entity ID
     * @param componentName Component名称
     */
    public removeComponentFromEntity(entityId: number, componentName: string): void {
        // 单例Component不能被删除
        if (this.singletonComponents.has(componentName)) {
            console.warn(`单例Component "${componentName}" 无法被删除，在进程中永久存在`);
            return;
        }

        // 更新Entity到Component的映射
        const entityComps = this.entityComponents.get(entityId);
        if (entityComps) {
            entityComps.delete(componentName);
            if (entityComps.size === 0) {
                this.entityComponents.delete(entityId);
            }
        }

        // 更新Component到Entity的映射
        const compEntities = this.componentEntities.get(componentName);
        if (compEntities) {
            compEntities.delete(entityId);
            if (compEntities.size === 0) {
                this.componentEntities.delete(componentName);
            }
        }
    }

    /**
     * 通过多个Component名称获取同时拥有这些Component的Entity
     * @param componentNames Component名称数组
     * @returns Entity数组
     */
    public getEntitiesWithComponents(world: World, componentNames: string[]): BaseEntity[] {
        if (componentNames.length === 0) {
            return [];
        }

        // 找到拥有第一个Component的Entity
        let candidateEntityIds = this.componentEntities.get(componentNames[0]);
        if (!candidateEntityIds) {
            return [];
        }

        // 过滤出同时拥有所有Component的Entity
        for (let i = 1; i < componentNames.length; i++) {
            const componentEntityIds = this.componentEntities.get(componentNames[i]);
            if (!componentEntityIds) {
                return [];
            }
            
            candidateEntityIds = new Set([...candidateEntityIds].filter(id => 
                componentEntityIds.has(id)
            ));
        }

        // 获取Entity实例
        const entities: BaseEntity[] = [];
        const entityManager = world.getEntitiesManager();
        
        for (const entityId of candidateEntityIds) {
            const entity = entityManager.getEntity(entityId);
            if (entity) {
                entities.push(entity);
            }
        }

        //log.info("getEntitiesWithComponents3", componentNames, entities);

        return entities;
    }

    /**
     * 清空所有注册信息（但不清空单例实例）
     */
    public clear(): void {
        this.componentConstructors.clear();
        this.componentFactories.clear();
        this.entityComponents.clear();
        this.componentEntities.clear();
        this.singletonComponents.clear();
        // 注意：不清空globalSingletonInstances，保持单例在进程中永久存在
        log.info('ComponentRegistry已清空，但单例Component保持永久存在');
    }

    /**
     * 获取所有已创建的单例Component
     * @returns 单例Component映射
     */
    public getAllSingletonInstances(): Map<string, BaseComponent> {
        return new Map(this.globalSingletonInstances);
    }
} 