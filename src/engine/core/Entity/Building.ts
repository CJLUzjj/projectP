import { BaseEntity } from "../Infra/Base/BaseEntity";
import { World } from "../Infra/World";

export class Building extends BaseEntity {
    constructor(world: World, id: number = 0) {
        super(world, id);

    }

    init() {
        this.addComponent("BuildingProperty");
        this.addComponent("Position");
    }
}
