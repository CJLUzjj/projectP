import { BaseEntity } from "./BaseEntity";

export class BaseComponent {
    owner: BaseEntity;
    componentName: string;

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
}
