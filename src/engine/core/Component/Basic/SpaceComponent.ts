import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent("Space")
export class SpaceComponent extends BaseComponent {
    private spaceId: number;

    constructor(owner: BaseEntity) {
        super(owner, "Space");
        this.spaceId = 0;
    }

    setSpaceId(spaceId: number) {
        this.spaceId = spaceId;
    }

    getSpaceId(): number {
        return this.spaceId;
    }
}


