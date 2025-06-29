import { EntitiesManager } from "../../EntitiesManager";
import { World } from "../../World";
import { BaseEntity } from "../BaseEntity";

export abstract class BaseSystem {
    name: string;
    focusComponent: string[];
    prevSystemsName: string[];
    world: World;

    constructor(world: World) {
        this.name = this.constructor.name;
        this.focusComponent = [];
        this.prevSystemsName = [];
        this.world = world;
    }

    addPrevSystem(systemName: string): void {
        this.prevSystemsName.push(systemName);
    }

    addFocusComponent(component: string): void {
        this.focusComponent.push(component);
    }

    getFocusComponent(): string[] {
        return this.focusComponent;
    }

    getEntities(): BaseEntity[] {
        return this.world.getEntitiesManager().getEntitiesWithComponents(this.world, this.focusComponent);
    }

    // 销毁组件，返回true则销毁完成，false则需要等待下一次tick继续回调
    onComponentDestroying(entity: BaseEntity, componentName: string): boolean {
        return true;
    }
}
