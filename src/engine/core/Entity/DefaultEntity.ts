import { BaseEntity } from "../Infra/Base/BaseEntity";
import { World } from "../Infra/World";

export class DefaultEntity extends BaseEntity {
    constructor(world: World, id: number = 0) {
        super(world, id);

    }

    init() {
    }
}