import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { MovementDirection } from "../../Data/CommonData";

@RegisterComponent("Movement")
export class MovementComponent extends BaseComponent {
    private moveSpeed: number;
    private direction: MovementDirection = { x: 0, y: 0 };

    constructor(owner: BaseEntity, moveSpeed: number = 100, direction: MovementDirection = { x: 0, y: 0 }) {
        super(owner, "Movement");
        this.moveSpeed = moveSpeed;
        this.direction = direction;
    }

    // 获取移动速度
    getMoveSpeed(): number {
        return this.moveSpeed;
    }

    // 设置移动速度
    setMoveSpeed(speed: number): void {
        this.moveSpeed = speed;
    }

    // 获取移动方向
    getDirection(): MovementDirection {
        return this.direction;
    }

    // 设置移动方向
    setDirection(direction: MovementDirection): void {
        this.direction = direction;
    }
}