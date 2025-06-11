import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { MessageService } from "./MessageService";
import { World } from "../../Infra/World";

export function createObserver<T extends BaseComponent>(
    target: T,
    callback: (target: T) => void
  ): T {
    return new Proxy(target, {
      set(target, prop: string | symbol, newVal, receiver) {
        const oldVal = target[prop as keyof T];
        (target as any)[prop] = newVal;
        callback(target); // 触发回调
        return true; // 表示设置成功
      }
    });
  }

export abstract class PropertySyncService {

    public constructor() {
    }

    // public syncWorld(world: World) {}

    // public addWorld(world: World) {}

    // public removeWorld(world: World) {}

    abstract onAddEntity(entity: BaseEntity): void;

    abstract onRemoveEntity(entity: BaseEntity): void;

    abstract onSyncComponent(component: BaseComponent): void;

    abstract onAddComponent(component: BaseComponent): void;

    abstract onRemoveComponent(component: BaseComponent): void;
}

export let globalPropertySyncService: PropertySyncService | null = null;

export function setGlobalPropertySyncService(newPropertySyncService: PropertySyncService) {
    if (globalPropertySyncService) {
        throw new Error("PropertySyncService already set");
    }
    globalPropertySyncService = newPropertySyncService;
}   
