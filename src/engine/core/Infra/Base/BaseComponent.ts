import { BaseEntity } from "./BaseEntity";

export class BaseComponent {
    private owner: BaseEntity;
    private componentName: string;
    private destroying: boolean = false;

    constructor(owner: BaseEntity, componentName: string) {
        this.owner = owner;
        this.componentName = componentName;
    }

    getComponentName(): string {
        return this.componentName;
    }

    getOwner(): BaseEntity {
        return this.owner;
    }

    // todo: 临时处理非直接属性赋值，后续需要定义一套标准的同步数据结构
    setDirty(): void {
        this.owner.getWorld().getSyncQueue().updateSyncComponent(this);
    }

    isDestroying(): boolean {
        return this.destroying;
    }

    setDestroying(destroying: boolean): void {
        this.destroying = destroying;
    }
}
