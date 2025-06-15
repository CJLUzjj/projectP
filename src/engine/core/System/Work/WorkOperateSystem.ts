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

// 目前是专属于建筑的一个system
@System(SystemType.Execute)
export class WorkOperateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "WorkOperate";
        this.prevSystemsName = [];
        this.focusComponent = ["Message"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const messageComponent = entity.getComponent("Message") as MessageComponent;
            if (messageComponent) {
                this.processStartWorkRequest(messageComponent);
                this.processStopWorkRequest(messageComponent);
            }
        }
    }

    processStartWorkRequest(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.START_WORK);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.START_WORK];
            const workType = params.workType as WorkType;
            if (!processStartWork(this.world, params.avatarId, params.buildingId, workType, params.monsterId, {x: params.x, y: params.y})) {
                log.info("工作开始失败", params.avatarId, params.buildingId, params.workType, params.monsterId);
            }
            log.info("工作开始成功", params.avatarId, params.buildingId, params.workType, params.monsterId);
        }
    }

    processStopWorkRequest(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.STOP_WORK);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.STOP_WORK];
            if (!processStopWork(this.world, params.avatarId, params.buildingId, params.monsterId)) {
                log.info("工作停止失败", params.avatarId, params.buildingId, params.monsterId);
            }
            log.info("工作停止成功", params.avatarId, params.buildingId, params.monsterId);
        }
    }
}