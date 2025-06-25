import { ExecuteSystem, System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseSystem } from "../../Infra/Base/System/BaseSystem";
import { World } from "../../Infra/World";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { processStartWork, processStopWork} from "../Utility/Work/Common";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MessageParams, MessageType } from "../../Interface/Common/MessageId";
import { WorkFlowData, WorkType } from "../../Data/WorkData";
import { log } from "../../Interface/Service/LogService";
import { WorkFlowComponent } from "../../Component/Work/WorkFlowComponent";
import { WorkStatus } from "../../Data/common";

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
            const space = this.world.getEntitiesManager().getEntity(params.spaceId);
            if (!space) {
                log.info("空间不存在", params.spaceId);
                continue;
            }
            let workFlow = space.getComponent("WorkFlow") as WorkFlowComponent;
            if (!workFlow) {
                workFlow = space.addComponent("WorkFlow") as WorkFlowComponent;
            }
            workFlow.addWorkFlow(
                new WorkFlowData(
                    params.avatarId, params.spaceId, workType, WorkStatus.None, params.monsterId, {q: params.q, r: params.r}
                ));
            log.info("工作开始成功", params.avatarId, params.workType, params.monsterId);
        }
    }

    processStopWorkRequest(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.STOP_WORK);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.STOP_WORK];
            const space = this.world.getEntitiesManager().getEntity(params.spaceId);
            if (!space) {
                log.info("空间不存在", params.spaceId);
                continue;
            }
            const workFlow = space.getComponent("WorkFlow") as WorkFlowComponent;
            if (!workFlow) {
                log.info("工作流不存在", params.spaceId);
                continue;
            }
            workFlow.cancelWorkFlow(params.monsterId);
            log.info("工作停止成功", params.avatarId, params.spaceId, params.monsterId);
        }
    }
}