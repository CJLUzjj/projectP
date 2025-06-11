import { BaseEntity } from "../Infra/Base/BaseEntity";
import { BaseComponent } from "../Infra/Base/BaseComponent";
import { RegisterComponent } from "../Infra/ComponentRegistry";

@RegisterComponent('Time')
export class TimeComponent extends BaseComponent {

    // 当前虚拟时间
    currentVirtualTime: number;

    constructor(owner: BaseEntity) {
        super(owner, "Time");
        this.currentVirtualTime = 0;
    }
    
    setVirtualTime(time: number) {
        this.currentVirtualTime = time;
    }

    getVirtualTime(): number {
        return this.currentVirtualTime;
    }
}


