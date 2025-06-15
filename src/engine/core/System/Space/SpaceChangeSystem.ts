import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MessageType } from "../../Interface/Common/MessageId";
import { log } from "../../Interface/Service/LogService";
import { RoomSpace } from "../../Entity/Space/RoomSpace";

@System(SystemType.Execute)
export class SpaceChangeSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "SpaceChange";
        this.addFocusComponent("Message");
    }

    execute(entities: BaseEntity[]): void {
        for (const entity of entities) {
            const messageComponent = entity.getComponent("Message") as MessageComponent;
            if (messageComponent) {
                this.processEnterRoom(messageComponent);
            }
        }
    }

    private processEnterRoom(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.ENTER_ROOM);
            if (!message) {
                break;
            }

            const leaveEntity = this.world.getEntitiesManager().getEntity(message.args.leaveEntityId);
            if (!leaveEntity) {
                log.error("leaveEntity not found", message.args.leaveEntityId);
                continue;
            }

            this.world.getEntitiesManager().removeEntity(leaveEntity.getId());

            const space = this.world.getEntitiesManager().createEntity(RoomSpace);
            this.world.setSpaceId(space.getId());
        }
    }
}