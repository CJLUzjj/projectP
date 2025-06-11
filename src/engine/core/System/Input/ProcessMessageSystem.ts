import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { globalMessageService, Message } from "../../Interface/Service/MessageService";
import { BaseInputSystem } from "../../Infra/Base/System/BaseInputSystem";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { MessageComponent } from "../../Component/Input/MessageComponent";

@System(SystemType.Input)
export class ProcessMessageSystem extends BaseInputSystem {
    constructor(world: World) {
        super(world);
        this.name = "ProcessMessage";
        this.prevSystemsName = [];
        this.focusComponent = ["Message"];
    }

    processInput(entities: BaseEntity[]) {
        if (!globalMessageService) {
            console.error("globalMessageService is not set");
            return;
        }
        while (true) {
            const message = globalMessageService.popMessage();
            if (!message) {
                break;
            }
            for (const entity of entities) {
                if (entity.hasComponent("Message")) {
                    const messageComponent = entity.getComponent("Message") as MessageComponent;
                    if (messageComponent) {
                        messageComponent.addMessage(message);
                    }
                }
            }
        }
    }
}