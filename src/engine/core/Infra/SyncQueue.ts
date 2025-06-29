import { BaseComponent } from "./Base/BaseComponent";
import { BaseEntity } from "./Base/BaseEntity";
import { log } from "../Interface/Service/LogService";
import { globalPropertySyncService } from "../Interface/Service/PropertySyncService";

export class SyncQueue {
    private entityAddQueue: Map<number, BaseEntity>;
    private entityRemoveQueue: Map<number, BaseEntity>;

    private componentAddQueue: Map<number, Map<string, BaseComponent>>;
    private componentRemoveQueue: Map<number, Map<string, BaseComponent>>;
    private componentSyncQueue: Map<number, Map<string, BaseComponent>>;

    constructor() {
        this.entityAddQueue = new Map<number, BaseEntity>();
        this.entityRemoveQueue = new Map<number, BaseEntity>();
        this.componentAddQueue = new Map<number, Map<string, BaseComponent>>();
        this.componentRemoveQueue = new Map<number, Map<string, BaseComponent>>();
        this.componentSyncQueue = new Map<number, Map<string, BaseComponent>>();
    }

    public updateAddEntity(entity: BaseEntity) {
        this.entityAddQueue.set(entity.getId(), entity);
        log.info("updateAddEntity", entity.getId());
    }

    public updateRemoveEntity(entity: BaseEntity) {
        if (this.entityAddQueue.has(entity.getId())) {
            this.entityAddQueue.delete(entity.getId());
        } else {
            this.entityRemoveQueue.set(entity.getId(), entity);
        }
        log.info("updateRemoveEntity", entity.getId());
    }

    public updateAddComponent(component: BaseComponent) {
        const entityId = component.getOwner().getId();
        const componentMap = this.componentAddQueue.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        } else {
            this.componentAddQueue.set(entityId, new Map<string, BaseComponent>());
            this.componentAddQueue.get(entityId)?.set(component.getComponentName(), component);
        }
        log.info("updateAddComponent", entityId, component.getComponentName());
    }
    
    public updateRemoveComponent(component: BaseComponent) {
        const entityId = component.getOwner().getId();
        const addComponentMap = this.componentAddQueue.get(entityId);
        if (addComponentMap) {
            if (addComponentMap.has(component.getComponentName())) {
                addComponentMap.delete(component.getComponentName());
                return;
            }
        }

        const componentMap = this.componentRemoveQueue.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        } else {
            this.componentRemoveQueue.set(entityId, new Map<string, BaseComponent>());
            this.componentRemoveQueue.get(entityId)?.set(component.getComponentName(), component);
        }
        log.info("updateRemoveComponent", entityId, component.getComponentName());
    }

    public updateSyncComponent(component: BaseComponent) {
        log.info("updateSyncComponent", component.getComponentName());
        const entityId = component.getOwner().getId();
        const addComponentMap = this.componentAddQueue.get(entityId);
        if (addComponentMap) {
            if (addComponentMap.has(component.getComponentName())) {
                return;
            }
        }

        const removeComponentMap = this.componentRemoveQueue.get(entityId);
        if (removeComponentMap) {
            if (removeComponentMap.has(component.getComponentName())) {
                return;
            }
        }

        const syncComponentMap = this.componentSyncQueue.get(entityId);
        if (syncComponentMap) {
            syncComponentMap.set(component.getComponentName(), component);
        } else {
            this.componentSyncQueue.set(entityId, new Map<string, BaseComponent>());
            this.componentSyncQueue.get(entityId)?.set(component.getComponentName(), component);
        }
    }

    public tick() {
        if (!globalPropertySyncService) {
            return;
        }
        for (const entity of this.entityAddQueue.values()) {
            globalPropertySyncService.onAddEntity(entity);
        }
        for (const entity of this.entityRemoveQueue.values()) {
            globalPropertySyncService.onRemoveEntity(entity);
        }
        for (const entity of this.componentAddQueue.values()) {
            for (const component of entity.values()) {
                globalPropertySyncService.onAddComponent(component);
            }
        }
        for (const entity of this.componentRemoveQueue.values()) {
            for (const component of entity.values()) {
                globalPropertySyncService.onRemoveComponent(component);
            }
        }
        for (const entity of this.componentSyncQueue.values()) {
            for (const component of entity.values()) {
                globalPropertySyncService.onSyncComponent(component);
            }
        }
        this.entityAddQueue.clear();
        this.entityRemoveQueue.clear();
        this.componentAddQueue.clear();
        this.componentRemoveQueue.clear();
        this.componentSyncQueue.clear();
    }
}