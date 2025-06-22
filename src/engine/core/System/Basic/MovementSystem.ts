import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { HexMapComponent } from "../../Component/Map/HexMapComponent";
import { MovementComponent } from "../../Component/Basic/MovementComponent";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { World } from "../../Infra/World";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { Position } from "../../Data/common";
import { log } from "../../Interface/Service/LogService";

@System(SystemType.Execute)
export class MovementSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "Movement";
        this.addFocusComponent("Movement");
        this.addFocusComponent("Position");
    }

    execute(entities: BaseEntity[]): void {
        for (const entity of entities) {
            const movementComponent = entity.getComponent("Movement") as MovementComponent;
            const positionComponent = entity.getComponent("Position") as PositionComponent;
            
            if (movementComponent == null || positionComponent == null) {
                continue;
            }

            if (movementComponent.getMoveSpeed() == 0) {
                continue;
            }

            if (movementComponent.getDirection().x == 0 && movementComponent.getDirection().y == 0) {
                continue;
            }

            const deltaTime = this.world.getCurrentDeltaTime() / 1000;

            // 处理移动
            this.processMovement(movementComponent, positionComponent, deltaTime);
        }
    }

    private processMovement(
        movementComponent: MovementComponent, 
        positionComponent: PositionComponent, 
        deltaTime: number
    ): void {
        const moveSpeed = movementComponent.getMoveSpeed();

        // 计算移动距离
        const moveDistance = moveSpeed * deltaTime;

        this.moveByDirection(movementComponent, positionComponent, moveDistance);
    }

    private moveByDirection(
        movementComponent: MovementComponent,
        positionComponent: PositionComponent,
        moveDistance: number
    ): void {
        const currentPos = positionComponent.getPosition();
        const direction = movementComponent.getDirection();

        // 标准化方向向量
        const directionLength = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (directionLength === 0) {
            return;
        }

        const normalizedDirectionX = direction.x / directionLength;
        const normalizedDirectionY = direction.y / directionLength;

        // 计算新位置
        const newX = currentPos.x + normalizedDirectionX * moveDistance;
        const newY = currentPos.y + normalizedDirectionY * moveDistance;

        // 更新位置
        positionComponent.setPosition(newX, newY);
    }
}