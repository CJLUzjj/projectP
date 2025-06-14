import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { SyntheticWorkProgressData, WorkType } from "../../Data/WorkData";
import { SyntheticWorkConfig } from "../../Data/config/work/SyntheticWork";
import { Position } from "../../Data/common";
@RegisterComponent("SyntheticWorkProgress")
export class SyntheticWorkProgressComponent extends BaseComponent {
    private progressMap: Map<number, SyntheticWorkProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "SyntheticWorkProgress");
        this.progressMap = new Map();
    }

    addWorkProgress(monsterId: number, workType: WorkType, buildingId: number, time: number, position: Position): SyntheticWorkProgressData | null {
        const workConfig = SyntheticWorkConfig.get(workType);
        if (!workConfig) {
            return null;
        }
        const progressData = new SyntheticWorkProgressData(monsterId, workType, time, time, 0, buildingId, position, workConfig);
        this.progressMap.set(monsterId, progressData);
        return progressData;
    }

    removeWorkProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getWorkProgress(monsterId: number): SyntheticWorkProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getWorkProgressList(): SyntheticWorkProgressData[] {
        return Array.from(this.progressMap.values());
    }
}
