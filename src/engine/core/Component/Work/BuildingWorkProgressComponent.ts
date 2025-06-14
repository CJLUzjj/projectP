import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { BuildingWorkProgressData, WorkType } from "../../Data/WorkData";
import { BuildingWorkConfig } from "../../Data/config/work/BuildingWork";
import { Position } from "../../Data/common";
@RegisterComponent("BuildingWorkProgress")
export class BuildingWorkProgressComponent extends BaseComponent {
    private progressMap: Map<number, BuildingWorkProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "BuildingWorkProgress");
        this.progressMap = new Map();
    }

    addWorkProgress(monsterId: number, workType: WorkType, buildingId: number, time: number, position: Position): BuildingWorkProgressData | null {
        const workConfig = BuildingWorkConfig.get(workType);
        if (!workConfig) {
            return null;
        }
        const progressData = new BuildingWorkProgressData(monsterId, workType, time, time, 0, buildingId, position, workConfig);
        this.progressMap.set(monsterId, progressData);
        return progressData;
    }

    removeWorkProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getWorkProgress(monsterId: number): BuildingWorkProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getWorkProgressList(): BuildingWorkProgressData[] {
        return Array.from(this.progressMap.values());
    }
}


