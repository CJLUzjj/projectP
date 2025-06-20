import { ItemBackpack } from "../Data/backpack/ItemBackpack";
import { BaseComponent } from "../Infra/Base/BaseComponent";
import { RegisterComponent } from "../Infra/ComponentRegistry";
import { BaseEntity } from "../Infra/Base/BaseEntity";

@RegisterComponent('Backpack')
export class BackpackComponent extends BaseComponent {

    itemBackpack: ItemBackpack;

    constructor(owner: BaseEntity) {
        super(owner, "Backpack");
        this.itemBackpack = new ItemBackpack();
    }
    
    getItemBackpack(): ItemBackpack {
        return this.itemBackpack;
    }

    deserialize(data: Record<string, any>) {
        this.itemBackpack.deserialize(data.itemBackpack);
    }
}

