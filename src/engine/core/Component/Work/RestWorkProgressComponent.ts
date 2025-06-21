import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { RestWorkProgressData, WorkType } from "../../Data/WorkData";
import { RestWorkConfig } from "../../Data/config/work/RestWork";
import { HexCoord } from "../../Data/MapData";
@RegisterComponent("RestWorkProgress")
export class RestWorkProgressComponent extends BaseComponent {
    private progressMap: Map<number, RestWorkProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "RestWorkProgress");
        this.progressMap = new Map();
    }

    addWorkProgress(monsterId: number, workType: WorkType, buildingId: number, time: number, hexPos: HexCoord): RestWorkProgressData | null {
        const workConfig = RestWorkConfig.get(workType);
        if (!workConfig) {
            return null;
        }
        const progressData = new RestWorkProgressData(monsterId, workType, time, time, 0, buildingId, hexPos, workConfig);
        this.progressMap.set(monsterId, progressData);
        return progressData;
    }

    removeWorkProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getWorkProgress(monsterId: number): RestWorkProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getWorkProgressList(): RestWorkProgressData[] {
        return Array.from(this.progressMap.values());
    }
}
