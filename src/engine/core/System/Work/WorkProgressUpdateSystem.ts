import { BaseSystem } from "../../Infra/Base/System/BaseSystem";
import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { WorkProgressComponent, WorkProgressData } from "../../Component/WorkProgressComponent";
import { processStopWork } from "../Utility/Work/Common";
import { OwnerComponent } from "../../Component/OwnerComponent";
import { Avatar } from "../../Entity/Avatar";
import { BackpackComponent } from "../../Component/BackpackComponent";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { SystemType } from "../../Infra/Decorators/SystemDecorator";
import { System } from "../../Infra/Decorators/SystemDecorator";
import { log } from "../../Interface/Service/LogService";
@System(SystemType.Execute)
export class WorkProgressUpdateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "WorkProgressUpdate";
        this.prevSystemsName = ["WorkOperate"];
        this.focusComponent = ["WorkProgress", "Owner"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const workProgress = entity.getComponent("WorkProgress") as WorkProgressComponent;
            const owner = entity.getComponent("Owner") as OwnerComponent;
            if (!workProgress || !owner) {
                continue;
            }
            for (const progress of workProgress.getWorkProgressList()) {
                this.updateWorkProgress(owner.getAvatarId(), progress);
            }
        }
    }

    updateWorkProgress(avatarId: number, progress: WorkProgressData) {
        const now = this.world.getCurrentVirtualTime();
        const totalTime = progress.endTime.getTime() - progress.startTime.getTime();
        const elapsedTime = now - progress.startTime.getTime();
        progress.progress = Math.min(1, elapsedTime / totalTime);
        // log.info("now", now, "totalTime", totalTime, "elapsedTime", elapsedTime, "progress", progress.progress);

        if (progress.progress >= 1) {
            this.completeWork(avatarId, progress);
            log.info("工作完成", avatarId, progress);
        }
    }

    completeWork(avatarId: number, progress: WorkProgressData) {
        // todo: 发放奖励
        const avatar = this.world.getEntitiesManager().getEntity(avatarId) as Avatar;
        if (!avatar) {
            log.info("avatar不存在", avatarId);
            return;
        }
        if (!avatar.hasComponent("Backpack")) {
            log.info("avatar没有Backpack组件", avatarId);
            return;
        }
        const backpack = avatar.getComponent("Backpack") as BackpackComponent;
        if (progress.workConfig) {
            for (const output of progress.workConfig.outputs) {
                backpack.getItemBackpack().addItemToBackpack(output.itemId, output.quantity);
            }
        }

        processStopWork(this.world, avatarId, progress.buildingId, progress.monsterId, true);
    }
}

