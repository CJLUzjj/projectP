import { World } from "../../World";
import { BaseSystem } from "./BaseSystem";

export abstract class BaseCleanSystem extends BaseSystem {
    constructor(world: World) {
        super(world);
    }

    abstract clean(): void;
}