import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent('AvatarProperty')
export class AvatarPropertyComponent extends BaseComponent {
    name: string;
    constructor(owner: BaseEntity) {
        super(owner, "AvatarProperty");
        this.name = "";
    }

    setName(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }
}