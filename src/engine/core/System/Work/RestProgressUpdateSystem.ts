import { BaseSystem } from "../../Infra/Base/System/BaseSystem";
import { World } from "../../Infra/World";
import { ExecuteSystem, System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { WorkProgressComponent, WorkProgressData } from "../../Component/WorkProgressComponent";
import { processStopRest, processStopWork } from "../Utility/Work/Common";
import { OwnerComponent } from "../../Component/OwnerComponent";
import { Avatar } from "../../Entity/Avatar";
import { BackpackComponent } from "../../Component/BackpackComponent";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { RestProgressComponent, RestProgressData } from "../../Component/RestProgressComponent";
import { Monster } from "../../Entity/Monster";
import { MonsterPropertyComponent } from "../../Component/Property/MonsterPropertyComponent";
import { log } from "../../Interface/Service/LogService";

@System(SystemType.Execute)
export class RestProgressUpdateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "RestProgressUpdate";
        this.prevSystemsName = ["WorkOperate"];
        this.focusComponent = ["RestProgress", "Owner"];
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const restProgress = entity.getComponent("RestProgress") as RestProgressComponent;
            const owner = entity.getComponent("Owner") as OwnerComponent;
            if (!restProgress || !owner) {
                continue;
            }
            for (const progress of restProgress.getRestProgressList()) {
                this.updateRestProgress(owner.getAvatarId(), progress);
            }
        }
    }

    updateRestProgress(avatarId: number, progress: RestProgressData) {
        const now = this.world.getCurrentVirtualTime();
        const totalTime = progress.endTime.getTime() - progress.startTime.getTime();
        const elapsedTime = now - progress.startTime.getTime();
        progress.progress = Math.min(1, elapsedTime / totalTime);

        const monster = this.world.getEntitiesManager().getEntity(progress.monsterId) as Monster;
        if (!monster) {
            log.info("怪物不存在", progress.monsterId);
            return;
        }

        if (monster.hasComponent("MonsterProperty")) {
            const monsterProperty = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
            monsterProperty.updateStamina(1);
        }

        if (progress.progress >= 1) {
            this.completeRest(avatarId, progress);
        }
    }

    completeRest(avatarId: number, progress: RestProgressData) {
        processStopRest(this.world, avatarId, progress.buildingId, progress.monsterId, true);
    }
}

