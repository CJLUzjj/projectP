import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { ProductionWorkProgressData, WorkType } from "../../Data/WorkData";
import { ProductionWorkConfig } from "../../Data/config/work/ProductionWork";
import { Position } from "../../Data/common";
import { HexCoord } from "../../Data/MapData";
@RegisterComponent("ProductionWorkProgress")
export class ProductionWorkProgressComponent extends BaseComponent {
    private progressMap: Map<number, ProductionWorkProgressData>;

    constructor(owner: BaseEntity) {
        super(owner, "ProductionWorkProgress");
        this.progressMap = new Map();
    }

    addWorkProgress(monsterId: number, workType: WorkType, buildingId: number, time: number, hexPos: HexCoord): ProductionWorkProgressData | null {
        const workConfig = ProductionWorkConfig.get(workType);
        if (!workConfig) {
            return null;
        }
        const progressData = new ProductionWorkProgressData(monsterId, workType, time, time, 0, buildingId, hexPos, workConfig);
        this.progressMap.set(monsterId, progressData);
        return progressData;
    }

    removeWorkProgress(monsterId: number) {
        this.progressMap.delete(monsterId);
    }

    getWorkProgress(monsterId: number): ProductionWorkProgressData | null {
        return this.progressMap.get(monsterId) || null;
    }

    getWorkProgressList(): ProductionWorkProgressData[] {
        return Array.from(this.progressMap.values());
    }
}
