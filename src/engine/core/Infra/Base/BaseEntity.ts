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
    private world: World;

    constructor(world: World, id: number = 0) {
        this.id = id;
        this.components = new Map();
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

    /**
     * 添加Component到此Entity
     * @param componentName Component名称
     * @param args 构造参数
     * @returns 创建的Component实例
     */
    addComponent<T extends BaseComponent>(componentName: string, ...args: any[]): T | null {
        const component = ComponentRegistry.getInstance().createComponent<T>(componentName, this, ...args);
        if (component) {
            this.components.set(componentName, component);
        }
        return component;
    }

    /**
     * 移除指定Component
     * @param componentName Component名称
     * @returns 是否成功移除
     */
    removeComponent(componentName: string): boolean {
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
            components: [] as Array<{name: string, data: any}>
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

