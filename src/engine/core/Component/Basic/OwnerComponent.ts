import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent("Owner")
export class OwnerComponent extends BaseComponent {
    private avatarId: number;

    constructor(owner: BaseEntity, avatarId: number) {
        super(owner, "Owner");
        this.avatarId = avatarId;
    }

    setAvatarId(avatarId: number) {
        this.avatarId = avatarId;
    }

    getAvatarId() {
        return this.avatarId;
    }
}
