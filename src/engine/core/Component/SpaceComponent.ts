import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";

@RegisterComponent("Space")
export class SpaceComponent extends BaseComponent {
    private spaceId: string;

    constructor(owner: BaseEntity) {
        super(owner, "Space");
        this.spaceId = "";
    }

    setSpaceId(spaceId: string) {
        this.spaceId = spaceId;
    }

    getSpaceId() {
        return this.spaceId;
    }
}


