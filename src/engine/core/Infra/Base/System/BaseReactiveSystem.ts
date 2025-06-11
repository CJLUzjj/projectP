import { World } from "../../World";
import { BaseSystem } from "./BaseSystem";
import { BaseEntity } from "../BaseEntity";

export abstract class BaseReactiveSystem extends BaseSystem {
    constructor(world: World) {
        super(world);
    }

    abstract onTrigger(entities: BaseEntity[]): void;
}