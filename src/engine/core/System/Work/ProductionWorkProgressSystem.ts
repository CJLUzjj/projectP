import { System } from "../../Infra/Decorators/SystemDecorator";
import { ProductionWorkProgressComponent } from "../../Component/Work/ProductionWorkProgressComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { SystemType } from "../../Infra/Decorators/SystemDecorator";
import { World } from "../../Infra/World";
import { log } from "../../Interface/Service/LogService";
import { OwnerComponent } from "../../Component/OwnerComponent";
import { processStopWork } from "../Utility/Work/Common";
import { ProductionWorkProgressData } from "../../Data/WorkData";
import { processFinishProductionWork } from "../Utility/Work/ProductionWork";
import { Building } from "../../Entity/Building";
import { Avatar } from "../../Entity/Avatar";

@System(SystemType.Execute)
export class ProductionWorkProgressSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "ProductionWorkProgress";
        this.prevSystemsName = ["WorkOperate"];
        this.focusComponent = ["ProductionWorkProgress", "Owner"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const workProgress = entity.getComponent("ProductionWorkProgress") as ProductionWorkProgressComponent;
            const owner = entity.getComponent("Owner") as OwnerComponent;
            if (!workProgress || !owner) {
                continue;
            }
            for (const progress of workProgress.getWorkProgressList()) {
                this.updateWorkProgress(owner.getAvatarId(), progress);
            }
        }
    }

    updateWorkProgress(avatarId: number, progress: ProductionWorkProgressData) {
        const now = this.world.getCurrentVirtualTime();
        const totalTime = progress.endTime - progress.startTime;
        const elapsedTime = now - progress.startTime;
        progress.progress = Math.min(1, elapsedTime / totalTime);
        // log.info("now", now, "totalTime", totalTime, "elapsedTime", elapsedTime, "progress", progress.progress);

        if (progress.progress >= 1) {
            this.completeWork(avatarId, progress);
            log.info("工作完成", avatarId, progress);
        }
    }

    completeWork(avatarId: number, progress: ProductionWorkProgressData) {
        const avatar = this.world.getEntitiesManager().getEntity(avatarId) as Avatar;
        if (!avatar) {
            log.info("avatar不存在", avatarId);
            return;
        }
        const building = this.world.getEntitiesManager().getEntity(progress.buildingId) as Building;
        if (!building) {
            log.info("building不存在", progress.buildingId);
            return;
        }
        processFinishProductionWork(this.world, avatar, building, progress.monsterId, progress);
        processStopWork(this.world, avatarId, progress.buildingId, progress.monsterId, true);
    }
}
