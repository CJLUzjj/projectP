import { World } from "../../World";
import { BaseSystem } from "./BaseSystem";
import { BaseEntity } from "../BaseEntity";

export abstract class BaseExcuteSystem extends BaseSystem {
    constructor(world: World) {
        super(world);
    }

    abstract execute(entities: BaseEntity[]): void;
}