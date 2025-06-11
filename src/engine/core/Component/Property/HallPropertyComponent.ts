import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { RegisterComponent } from "../../Infra/ComponentRegistry";

@RegisterComponent('HallProperty')
export class HallPropertyComponent extends BaseComponent {
    length: number;
    width: number;
    constructor(owner: BaseEntity) {
        super(owner, "HallProperty");
        this.length = 0;
        this.width = 0;
    }

    setLength(length: number) {
        this.length = length;
    }

    getLength(): number {
        return this.length;
    }

    setWidth(width: number) {
        this.width = width;
    }

    getWidth(): number {
        return this.width;
    }
}