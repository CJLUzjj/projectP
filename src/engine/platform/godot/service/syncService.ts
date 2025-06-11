import { PropertySyncService } from "../../../core/Interface/Service/PropertySyncService";
import { BaseEntity } from "../../../core/Infra/Base/BaseEntity";
import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { log } from "../../../core/Interface/Service/LogService";
import { createSenceMap } from "../common/instantiation";

export class SyncCallback {
    addCallback: (component: BaseComponent) => void = () => {};
    syncCallback: (component: BaseComponent) => void = () => {};
    removeCallback: () => void = () => {};
}

// 当entity的component被改变时，调用syncMap中的函数
let syncMap = new Map<number, SyncCallback>();

// key:entityId
// value:componentMap
// componentMap的key:componentName
// componentMap的value:component
let data : Map<number, Map<string, BaseComponent>> = new Map();

export class GodotPropertySyncService extends PropertySyncService {
    public onAddEntity(entity: BaseEntity): void {
        data.set(entity.getId(), new Map());
        log.info("addEntity", entity.getId());
    }

    public onRemoveEntity(entity: BaseEntity): void {
        const syncCallback = syncMap.get(entity.getId());
        if (syncCallback) {
            syncCallback.removeCallback();
        }
        syncMap.delete(entity.getId());
        data.delete(entity.getId());
        log.info("removeEntity", entity.getId());
    }

    public onSyncComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const syncCallback = syncMap.get(entityId);
        if (syncCallback) {
            syncCallback.syncCallback(component);
        }
        log.info("syncComponent", component.owner.getId(), component.getComponentName());
    }

    public onAddComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        }
        const createFunc = createSenceMap.get(component.getComponentName());
        if (createFunc) {
            log.info("createFunc", component.getComponentName());
            if (syncMap.has(entityId)) {
                log.error("entity存在两个需要实例化的component", entityId, componentMap?.keys());
                return;
            }
            const syncCallback = createFunc(entityId, component);
            syncMap.set(entityId, syncCallback);
        } else {
            const syncCallback = syncMap.get(entityId);
            if (syncCallback) {
                syncCallback.addCallback(component);
            }
        }
        log.info("addComponent", component.owner.getId(), component.getComponentName());
    }

    public onRemoveComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.delete(component.getComponentName());
        }
        log.info("removeComponent", component.owner.getId(), component.getComponentName());
    }
}