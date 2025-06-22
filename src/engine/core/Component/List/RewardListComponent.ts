import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent("RewardList")
export class RewardListComponent extends BaseComponent {
    private rewards: number[];
    constructor(entity: BaseEntity) {
        super(entity, "RewardList");
        this.rewards = [];
    }

    addReward(reward: number) {
        this.rewards.push(reward);
    }

    getRewards() {
        return this.rewards;
    }

    clearRewards() {
        this.rewards = [];
    }
}
