import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";

export class HallSpace extends BaseEntity {
    constructor(world: World, id: number = 0) {
        super(world, id);
    }

    init(): void {
        this.addComponent("HallProperty");
    }
}