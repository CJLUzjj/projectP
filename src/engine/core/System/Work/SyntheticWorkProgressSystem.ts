import { System } from "../../Infra/Decorators/SystemDecorator";
import { ProductionWorkProgressComponent } from "../../Component/Work/ProductionWorkProgressComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { SystemType } from "../../Infra/Decorators/SystemDecorator";
import { World } from "../../Infra/World";
import { log } from "../../Interface/Service/LogService";
import { OwnerComponent } from "../../Component/Basic/OwnerComponent";
import { processStopWork } from "../Utility/Work/Common";
import { ProductionWorkProgressData, SyntheticWorkProgressData } from "../../Data/WorkData";
import { processFinishProductionWork } from "../Utility/Work/ProductionWork";
import { Building } from "../../Entity/Building";
import { Avatar } from "../../Entity/Avatar";
import { SyntheticWorkProgressComponent } from "../../Component/Work/SyntheticWorkProgressComponent";
import { processFinishSyntheticWork } from "../Utility/Work/SyntheticWork";
import { BuildingPropertyComponent } from "../../Component/Property/BuildingPropertyComponent";
@System(SystemType.Execute)
export class SyntheticWorkProgressSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "SyntheticWorkProgress";
        this.prevSystemsName = ["WorkOperate"];
        this.focusComponent = ["SyntheticWorkProgress", "Owner"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const workProgress = entity.getComponent("SyntheticWorkProgress") as SyntheticWorkProgressComponent;
            const owner = entity.getComponent("Owner") as OwnerComponent;
            if (!workProgress || !owner) {
                continue;
            }
            for (const progress of workProgress.getWorkProgressList()) {
                this.updateWorkProgress(owner.getAvatarId(), progress);
            }
        }
    }

    updateWorkProgress(avatarId: number, progress: SyntheticWorkProgressData) {
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

    completeWork(avatarId: number, progress: SyntheticWorkProgressData) {
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
        const buildingProperty = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
        const spaceId = buildingProperty.getSpaceId();

        processFinishSyntheticWork(this.world, avatar, building, progress.monsterId, progress);
        processStopWork(this.world, avatarId, spaceId, progress.monsterId, progress.hexPos, true);
    }
}
