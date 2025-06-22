import { BaseEntity } from "../Infra/Base/BaseEntity";
import { World } from "../Infra/World";

export class Avatar extends BaseEntity {

    constructor(world: World, id: number = 0) {
        super(world, id);
    }

    init() {
        this.addComponent("AvatarProperty");
        this.addComponent("Backpack");
        this.addComponent("MonsterList");
        this.addComponent("Space");
        this.addComponent("Message");
        this.addComponent("RewardList");
    }
}