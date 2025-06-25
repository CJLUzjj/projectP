import { BaseComponent } from "../../Infra/Base/BaseComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { RegisterComponent } from "../../Infra/ComponentRegistry";
import { WorkFlowData, WorkType } from "../../Data/WorkData";
import { WorkStatus } from "../../Data/common";

@RegisterComponent("WorkFlow")
export class WorkFlowComponent extends BaseComponent {
    private workFlow: Map<number, WorkFlowData> = new Map();
    constructor(owner: BaseEntity) {
        super(owner, "WorkFlow");
    }

    addWorkFlow(workFlow: WorkFlowData) {
        this.workFlow.set(workFlow.monsterId, workFlow);
    }

    removeWorkFlow(monsterId: number) {
        this.workFlow.delete(monsterId);
    }

    getWorkFlow(monsterId: number): WorkFlowData | null {
        return this.workFlow.get(monsterId) || null;
    }

    getWorkFlowList(): WorkFlowData[] {
        return Array.from(this.workFlow.values());
    }

    cancelWorkFlow(monsterId: number) {
        const workFlow = this.getWorkFlow(monsterId);
        if (!workFlow) {
            return;
        }
        workFlow.lastStatus = workFlow.status;
        workFlow.status = WorkStatus.Canceled;
    }
}