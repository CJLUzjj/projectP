import { World } from "../../World";
import { BaseSystem } from "./BaseSystem";
import { BaseEntity } from "../BaseEntity";

export abstract class BaseInputSystem extends BaseSystem {
    constructor(world: World) {
        super(world);
    }

    abstract processInput(entities: BaseEntity[]): void;
}
