import { ExecuteSystem, System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseSystem } from "../../Infra/Base/System/BaseSystem";
import { World } from "../../Infra/World";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { processStartWork, processStopWork} from "../Utility/Work/Common";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MessageParams, MessageType } from "../../Interface/Common/MessageId";
import { WorkType } from "../../Data/WorkData";
import { log } from "../../Interface/Service/LogService";
import { NavigationState } from "../../Component/Map/HexMapNavitationComponent";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { MovementComponent } from "../../Component/Basic/MovementComponent";

@System(SystemType.Execute)
export class BasicOperationSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "BasicOperation";
        this.prevSystemsName = [];
        this.addFocusComponent("Message")
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const messageComponent = entity.getComponent("Message") as MessageComponent;
            if (messageComponent) {
                this.provessMoveToRequest(messageComponent);
            }
        }
    }

    provessMoveToRequest(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.MOVE_TO);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.MOVE_TO];
            const entity = this.world.getEntitiesManager().getEntity(params.entityId);
            if (!entity) {
                log.info("entity 不存在", params.entityId);
                return;
            }

            const positionComponent = entity.getComponent("Position") as PositionComponent;
            if (!positionComponent) {
                log.info("entity 不存在Position组件", params.entityId);
                return;
            }

            const movementComponent = entity.getComponent("Movement") as MovementComponent;
            if (!movementComponent) {
                log.info("entity 不存在Movement组件", params.entityId);
                return;
            }

            if (movementComponent.getMoveSpeed() <= 0) {
                log.info("entity 移动速度为0", params.entityId);
                return;
            }

            const space = this.world.getEntitiesManager().getEntity(params.spaceId);
            if (!space) {
                log.info("space 不存在", params.spaceId);
                return;
            }

            const hexMapComponent = space.getComponent("HexMap");
            if (!hexMapComponent) {
                log.info("space 不存在HexMap组件", params.spaceId);
                return;
            }

            // todo: 校验entityId是否属于avatar

            entity.addComponent("HexMapNavitation", positionComponent.getHexCoord(), { q: params.q, r: params.r }, params.spaceId);
        }
    }
}