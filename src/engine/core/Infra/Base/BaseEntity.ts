import { EntitiesManager } from "../EntitiesManager";
import { ComponentRegistry } from "../ComponentRegistry";
import { BaseComponent } from "./BaseComponent";
import { World } from "../World";
import { createObserver, globalPropertySyncService, PropertySyncService } from "../../Interface/Service/PropertySyncService";
import { log } from "../../Interface/Service/LogService";
import { BackpackComponent } from "../../Component/Basic/BackpackComponent";

export class BaseEntity {
    private id: number;
    private components: Map<string, BaseComponent>;
    private pendingComponents: Map<string, BaseComponent>;
    private pendingRefCount: Map<string, number>;
    private destroyingComponents: Map<string, string>;
    private world: World;

    constructor(world: World, id: number = 0) {
        this.id = id;
        this.components = new Map();
        this.pendingComponents = new Map();
        this.pendingRefCount = new Map();
        this.destroyingComponents = new Map();
        this.world = world;
    }

    // 子类重写初始化方法
    init() {
    }

    destroy() {
        this.world.getEntitiesManager().removeEntity(this.id);
        for (const component of this.components.values()) {
            ComponentRegistry.getInstance().removeComponentFromEntity(this.id, component.getComponentName());
        }
        this.components.clear();
    }

    getId(): number {
        return this.id;
    }

    /**
     * 获取指定的Component实例
     * @param componentName Component名称
     * @returns Component实例，如果不存在返回null
     */
    getComponent<T extends BaseComponent>(componentName: string): T | null {
        return this.components.get(componentName) as T | null;
    }

    /**
     * 获取所有Component实例
     * @returns Component实例的Map，key为Component名称
     */
    getAllComponents(): Map<string, BaseComponent> {
        return this.components;
    }

    /**
     * 检查是否拥有指定Component
     * @param componentName Component名称
     * @returns 是否拥有该Component
     */
    hasComponent(componentName: string): boolean {
        return this.components.has(componentName);
    }

    canAddComponent(componentName: string): boolean {
        if (this.components.has(componentName)) {
            return false;
        }
        if (this.pendingComponents.has(componentName)) {
            return false;
        }
        const replaceComponents = ComponentRegistry.getInstance().checkComponentReplace(componentName, this.components);
        const exclusiveComponents = ComponentRegistry.getInstance().checkComponentExclusive(componentName, this.components);
        if (exclusiveComponents.length > 0) {
            for (const component1 of exclusiveComponents) {
                let find = false;
                for (const component2 of replaceComponents) {
                    if (component1.getComponentName() === component2.getComponentName()) {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    log.error(`Component ${componentName} is exclusive with ${component1.getComponentName()}`);
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 添加Component到此Entity
     * @param componentName Component名称
     * @param args 构造参数
     * @returns 创建的Component实例
     */
    addComponent<T extends BaseComponent>(componentName: string, ...args: any[]): T | null {
        if (this.components.has(componentName)) {
            log.error(`Component ${componentName} already exists`);
            return null;
        }
        if (this.pendingComponents.has(componentName)) {
            log.error(`Component ${componentName} is pending`);
            return null;
        }
        const replaceComponents = ComponentRegistry.getInstance().checkComponentReplace(componentName, this.components);
        const exclusiveComponents = ComponentRegistry.getInstance().checkComponentExclusive(componentName, this.components);
        if (exclusiveComponents.length > 0) {
            for (const component1 of exclusiveComponents) {
                let find = false;
                for (const component2 of replaceComponents) {
                    if (component1.getComponentName() === component2.getComponentName()) {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    log.error(`Component ${componentName} is exclusive with ${component1.getComponentName()}`);
                    return null;
                }
            }
        }
        for (const component of replaceComponents) {
            this.removeComponent(component.getComponentName());
        }
        const component = ComponentRegistry.getInstance().createComponent<T>(componentName, this, ...args);
        if (component) {
            if (replaceComponents.length > 0) {
                this.pendingComponents.set(componentName, component);
                this.pendingRefCount.set(componentName, replaceComponents.length);
            } else {
                const newComponent = ComponentRegistry.getInstance().addComponent(component, this);
                this.components.set(componentName, newComponent);
            }
        }
        return component;
    }

    /**
     * 将Component标记为销毁
     * @param componentName Component名称
     * @returns 是否成功移除
     */
    removeComponent(componentName: string, removedBy: string = ""): boolean {
        if (this.hasComponent(componentName)) {
            const component = this.getComponent(componentName);
            if (component) {
                component.setDestroying(true);
                this.components.delete(componentName);
                this.destroyingComponents.set(componentName, removedBy);
            }
        }
        return false;
    }

    /**
     * 真正移除Component
     * @param componentName Component名称
     * @returns 是否成功移除
     */
    realRemoveComponent(componentName: string): boolean {
        if (this.hasComponent(componentName)) {
            const component = this.getComponent(componentName);
            if (component) {
                if (globalPropertySyncService) {
                    globalPropertySyncService.onRemoveComponent(component);
                }
                ComponentRegistry.getInstance().removeComponentFromEntity(this.id, componentName)
                this.components.delete(componentName);
                return true;
            }
        }
        return false;
    }

    getDestroyingComponents(): BaseComponent[] {
        const result: BaseComponent[] = [];
        for (const [componentName, removedBy] of this.destroyingComponents) {
            const component = this.components.get(componentName);
            if (component) {
                result.push(component);
            }
        }
        return result;
    }

    removeDestroyingComponent(componentName: string): void {
        if (this.destroyingComponents.has(componentName)) {
            const removedBy = this.destroyingComponents.get(componentName);
            if (removedBy && removedBy !== "") {
                let refCount = this.pendingRefCount.get(removedBy);
                if (refCount) {
                    refCount -= 1;
                    if (refCount <= 0) {
                        const component = this.pendingComponents.get(removedBy);
                        if (component) {
                            const newComponent = ComponentRegistry.getInstance().addComponent(component, this);
                            this.components.set(removedBy, newComponent);
                        }
                        this.pendingComponents.delete(removedBy);
                        this.pendingRefCount.delete(removedBy);
                    } else {
                        this.pendingRefCount.set(removedBy, refCount);
                    }
                }
            }
        }
        this.destroyingComponents.delete(componentName);
    }

    getWorld(): World {
        return this.world;
    }

    tick() {
    }

    serialize(): Record<string, any> {
        const components = this.getAllComponents();
        
        // 创建序列化数据对象，排除world属性
        const serializationData = {
            id: this.id,
            components: [] as Array<{name: string, data: any}>,
            destroyingComponents: this.destroyingComponents
        };
        
        // 序列化所有组件
        for (const [componentName, component] of components) {
            let componentData: any;
            // 如果组件有 serialize 方法，优先调用
            if (typeof (component as any).serialize === 'function') {
                componentData = (component as any).serialize();
            } else {
                // 获取组件的所有可枚举属性，排除循环引用属性
                componentData = {};
                for (const key in component) {
                    if (key !== 'world' && key !== 'owner' && component.hasOwnProperty(key)) {
                        componentData[key] = (component as any)[key];
                    }
                }
            }
            serializationData.components.push({
                name: componentName,
                data: componentData
            });
        }

        return serializationData;
    }

    deserialize(data: Record<string, any>) {
        try {
            const serializationData = data;
            
            // 恢复id
            this.id = serializationData.id;
            this.destroyingComponents = serializationData.destroyingComponents;

            this.world.getSyncQueue().updateAddEntity(this);
            
            // 清空现有组件
            this.components.clear();
            // 恢复组件
            for (const componentInfo of serializationData.components) {
                const componentName = componentInfo.name;
                const componentData = componentInfo.data;
                
                // 创建组件实例
                const component = ComponentRegistry.getInstance().createComponent(componentName, this);
                if (component) {
                    // 如果组件有 deserialize 方法，优先调用
                    if (typeof (component as any).deserialize === 'function') {
                        (component as any).deserialize(componentData);
                    } else {
                        // 恢复组件数据，排除循环引用属性（这些会在创建时自动设置）
                        for (const key in componentData) {
                            if (key !== "owner" && componentData.hasOwnProperty(key)) {
                                (component as any)[key] = componentData[key];
                            }
                        }
                    }
                    this.components.set(componentName, component);
                }
            }
        } catch (error) {
            console.error('反序列化Entity时发生错误:', error);
            throw new Error(`反序列化失败: ${error}`);
        }
    }
}

