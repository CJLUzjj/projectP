import { WorkInfoConfig } from "../Data/config/WorkInfoConfig";
import { WorkType, WorkInfo } from "../Data/WorkData";
import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";

export interface RestProgressData {
    monsterId: number;
    workType: WorkType;
    startTime: Date;
    endTime: Date;
    progress: number;
    buildingId: number;
    workConfig: WorkInfo | null;
}

@RegisterComponent("RestProgress")
export class RestProgressComponent extends BaseComponent {
    private progressMap: Map<number, RestProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "RestProgress");
        this.progressMap = new Map();
    }

    addRestProgress(monsterId: number, buildingId: number, time: number): RestProgressData | null {
        const workConfig = WorkInfoConfig.get(WorkType.Rest);
        if (!workConfig) {
            return null;
        }
        this.progressMap.set(monsterId, {
            monsterId: monsterId,
            workType: WorkType.Rest,
            startTime: new Date(time),
            endTime: new Date(time),
            progress: 0,
            buildingId: buildingId,
            workConfig: workConfig,
        });
        return this.progressMap.get(monsterId) || null;
    }

    removeRestProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getRestProgress(monsterId: number): RestProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getRestProgressList(): RestProgressData[] {
        return Array.from(this.progressMap.values());
    }
}
