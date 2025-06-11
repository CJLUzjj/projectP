import { World } from "../../World";
import { BaseSystem } from "./BaseSystem";

export abstract class BaseInitializeSystem extends BaseSystem {
    constructor(world: World) {
        super(world);
    }
    
    abstract initialize(): void;
}   