import { System } from "../../Infra/Decorators/SystemDecorator";
import { ProductionWorkProgressComponent } from "../../Component/Work/ProductionWorkProgressComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { SystemType } from "../../Infra/Decorators/SystemDecorator";
import { World } from "../../Infra/World";
import { log } from "../../Interface/Service/LogService";
import { OwnerComponent } from "../../Component/Basic/OwnerComponent";
import { processStopWork } from "../Utility/Work/Common";
import { ProductionWorkProgressData, RestWorkProgressData } from "../../Data/WorkData";
import { Building } from "../../Entity/Building";
import { Avatar } from "../../Entity/Avatar";
import { RestWorkProgressComponent } from "../../Component/Work/RestWorkProgressComponent";
import { processFinishRestWork } from "../Utility/Work/RestWork";
import { MonsterPropertyComponent } from "../../Component/Property/MonsterPropertyComponent";
import { Monster } from "../../Entity/Monster";
import { BuildingPropertyComponent } from "../../Component/Property/BuildingPropertyComponent";
@System(SystemType.Execute)
export class RestWorkProgressSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "RestWorkProgress";
        this.prevSystemsName = ["WorkOperate"];
        this.focusComponent = ["RestWorkProgress", "Owner"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const workProgress = entity.getComponent("RestWorkProgress") as RestWorkProgressComponent;
            const owner = entity.getComponent("Owner") as OwnerComponent;
            if (!workProgress || !owner) {
                continue;
            }
            for (const progress of workProgress.getWorkProgressList()) {
                this.updateWorkProgress(owner.getAvatarId(), progress);
            }
        }
    }

    updateWorkProgress(avatarId: number, progress: RestWorkProgressData) {
        const now = this.world.getCurrentVirtualTime();
        const totalTime = progress.endTime - progress.startTime;
        const elapsedTime = now - progress.startTime;
        const oldProgress = progress.progress;
        progress.progress = Math.min(1, elapsedTime / totalTime);
        // log.info("now", now, "totalTime", totalTime, "elapsedTime", elapsedTime, "progress", progress.progress);

        const monster = this.world.getEntitiesManager().getEntity(progress.monsterId) as Monster;
        if (!monster) {
            log.info("怪物不存在", progress.monsterId);
            return;
        }

        if (monster.hasComponent("MonsterProperty")) {
            const monsterProperty = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
            const workConfig = progress.workConfig;
            // todo：这里要调整，不能根据tick频率来更新体力，要根据绝对时间
            monsterProperty.updateStamina(workConfig.efficiency * 0.01);
        }

        if (progress.progress >= 1) {
            this.completeWork(avatarId, progress);
            log.info("工作完成", avatarId, progress);
        }
    }

    completeWork(avatarId: number, progress: RestWorkProgressData) {
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

        processFinishRestWork(this.world, avatar, building, progress.monsterId, progress);
        processStopWork(this.world, avatarId, spaceId, progress.monsterId, progress.hexPos, true);
    }
}
