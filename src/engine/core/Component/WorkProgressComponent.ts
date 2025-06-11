import { WorkInfoConfig } from "../Data/config/WorkInfoConfig";
import { WorkType, WorkInfo } from "../Data/WorkData";
import { BaseComponent } from "../Infra/Base/BaseComponent";
import { BaseEntity } from "../Infra/Base/BaseEntity";
import { RegisterComponent } from "../Infra/ComponentRegistry";

export interface WorkProgressData {
    monsterId: number;
    workType: WorkType;
    startTime: Date;
    endTime: Date;
    progress: number;
    buildingId: number;
    workConfig: WorkInfo | null;
}

@RegisterComponent("WorkProgress")
export class WorkProgressComponent extends BaseComponent {
    private progressMap: Map<number, WorkProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "WorkProgress");
        this.progressMap = new Map();
    }

    addWorkProgress(monsterId: number, workType: WorkType, buildingId: number, time: number): WorkProgressData | null {
        const workConfig = WorkInfoConfig.get(workType);
        if (!workConfig) {
            return null;
        }
        this.progressMap.set(monsterId, {
            monsterId: monsterId,
            workType: workType,
            startTime: new Date(time),
            endTime: new Date(time),
            progress: 0,
            buildingId: buildingId,
            workConfig: workConfig,
        });
        return this.progressMap.get(monsterId) || null;
    }

    removeWorkProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getWorkProgress(monsterId: number): WorkProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getWorkProgressList(): WorkProgressData[] {
        return Array.from(this.progressMap.values());
    }
}
