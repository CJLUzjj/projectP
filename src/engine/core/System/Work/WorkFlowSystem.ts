import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { System } from "../../Infra/Decorators/SystemDecorator";
import { SystemType } from "../../Infra/Decorators/SystemDecorator";
import { World } from "../../Infra/World";
import { WorkFlowComponent } from "../../Component/Work/WorkFlowComponent";
import { WorkFlowData, WorkType } from "../../Data/WorkData";
import { PalStatus, WorkBaseType, WorkStatus } from "../../Data/common";
import { Monster } from "../../Entity/Monster";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { HexMapNavitationComponent, NavigationState } from "../../Component/Map/HexMapNavitationComponent";
import { log } from "../../Interface/Service/LogService";
import { processStartWork, processStopWork, workIndex } from "../Utility/Work/Common";
import { Building } from "../../Entity/Building";
import { BuildingWorkProgressComponent } from "../../Component/Work/BuildingWorkProgressComponent";
import { ProductionWorkProgressComponent } from "../../Component/Work/ProductionWorkProgressComponent";
import { RestWorkProgressComponent } from "../../Component/Work/RestWorkProgressComponent";
import { SyntheticWorkProgressComponent } from "../../Component/Work/SyntheticWorkProgressComponent";
import { MonsterPropertyComponent } from "../../Component/Property/MonsterPropertyComponent";
import { stopMonsterMoving } from "../Utility/Monster/Common";
@System(SystemType.Execute)
export class WorkFlowSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "WorkFlow";
        this.addPrevSystem("WorkOperate");
        this.addPrevSystem("BasicOperation");
        this.addPrevSystem("BuildingWorkProgress");
        this.addPrevSystem("ProductionWorkProgress");
        this.addPrevSystem("RestWorkProgress");
        this.addPrevSystem("SyntheticWorkProgress");
        this.addFocusComponent("WorkFlow");
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const workFlow = entity.getComponent("WorkFlow") as WorkFlowComponent;
            if (!workFlow) {
                continue;
            }

            const deleteList: number[] = [];
            for (const workFlowData of workFlow.getWorkFlowList()) {
                const shouldDelete = this.updateWorkFlow(workFlowData);
                if (shouldDelete) {
                    this.resetMonsterStatus(workFlowData);
                    deleteList.push(workFlowData.monsterId);
                }
            }

            for (const monsterId of deleteList) {
                workFlow.removeWorkFlow(monsterId);
            }
        }
    }

    resetMonsterStatus(workFlow: WorkFlowData) {
        const monster = this.world.getEntitiesManager().getEntity(workFlow.monsterId) as Monster;
        if (!monster) {
            return;
        }
        const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
        monsterPropertyComponent.status = PalStatus.Idle;
    }

    updateWorkFlow(workFlow: WorkFlowData): boolean {
        const monster = this.world.getEntitiesManager().getEntity(workFlow.monsterId) as Monster;
        if (!monster) {
            return true;
        }

        switch (workFlow.status) {
            case WorkStatus.None:
                const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
                if (monsterPropertyComponent.status != PalStatus.Idle && monsterPropertyComponent.status != PalStatus.Moving) {
                    log.error("怪物状态异常", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos, monsterPropertyComponent.status);
                    return true;
                }
                if (monsterPropertyComponent.status == PalStatus.Moving) {
                    stopMonsterMoving(monster);
                }
                const positionComponent = monster.getComponent("Position") as PositionComponent;
                if (positionComponent) {
                    const hexCoord = positionComponent.getHexCoord();
                    if (hexCoord.q != workFlow.hexPos.q || hexCoord.r != workFlow.hexPos.r) {
                        workFlow.naviAddTimestamp = this.world.getCurrentVirtualTime();
                        monsterPropertyComponent.status = PalStatus.MovingToWork;
                        monster.addComponent("HexMapNavitation", hexCoord, workFlow.hexPos, workFlow.buildingId, workFlow.naviAddTimestamp);
                        workFlow.status = WorkStatus.Moving;
                    } else {
                        workFlow.status = WorkStatus.MovingDone;
                    }
                }
                break;
            case WorkStatus.Moving:
                const hexMapNavitation = monster.getComponent("HexMapNavitation") as HexMapNavitationComponent;
                if (hexMapNavitation) {
                    if (hexMapNavitation.getAddTimestamp() != workFlow.naviAddTimestamp) {
                        log.warn("导航组件被其他系统替换了", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos);
                        return true;
                    }
                    if (hexMapNavitation.getState() == NavigationState.Arrived) {
                        workFlow.status = WorkStatus.MovingDone;
                        const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
                        monsterPropertyComponent.status = PalStatus.Idle;
                        hexMapNavitation.setState(NavigationState.Finished);
                    } else if (hexMapNavitation.getState() == NavigationState.Failed) {
                        log.error("路径寻找失败", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos);
                        hexMapNavitation.setState(NavigationState.Finished);
                        return true;
                    }
                }
                break;
            case WorkStatus.MovingDone:
                const success = processStartWork(this.world, workFlow.avatarId, workFlow.spaceId, workFlow.workType, workFlow.monsterId, workFlow.hexPos);
                if (success) {
                    workFlow.status = WorkStatus.Working;
                } else {
                    log.error("开始工作失败", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos);
                    return true;
                }
                break;
            case WorkStatus.Working:
                const baseType = workIndex.get(workFlow.workType);
                if (!baseType) {
                    log.info("工作类型不存在", workFlow.workType);
                    return true;
                }
                const building = this.world.getEntitiesManager().getEntity(workFlow.buildingId) as Building;
                if (!building) {
                    log.error("建筑不存在", workFlow.buildingId);
                    return true;
                }
                if (baseType == WorkBaseType.Building) {
                    const workProgress = building.getComponent("BuildingWorkProgress") as BuildingWorkProgressComponent;
                    if (!workProgress) {
                        log.error("建筑不存在WorkProgress组件", workFlow.buildingId);
                        return true;
                    }
                    const workProgressData = workProgress.getWorkProgress(workFlow.monsterId);
                    if (!workProgressData) {
                        log.error("建筑不存在WorkProgress数据", workFlow.buildingId);
                        return true;
                    }
                    if (workProgressData.progress >= 1) {
                        workFlow.status = WorkStatus.Finished;
                    }
                } else if (baseType == WorkBaseType.Production) {
                    const productionWorkProgress = building.getComponent("ProductionWorkProgress") as ProductionWorkProgressComponent;
                    if (!productionWorkProgress) {
                        log.error("建筑不存在ProductionWorkProgress组件", workFlow.buildingId);
                        return true;
                    }
                    const workProgressData = productionWorkProgress.getWorkProgress(workFlow.monsterId);
                    if (!workProgressData) {
                        log.error("建筑不存在WorkProgress数据", workFlow.buildingId);
                        return true;
                    }
                    if (workProgressData.progress >= 1) {
                        workFlow.status = WorkStatus.Finished;
                    }
                } else if (baseType == WorkBaseType.Rest) {
                    const restWorkProgress = building.getComponent("RestWorkProgress") as RestWorkProgressComponent;
                    if (!restWorkProgress) {
                        log.error("建筑不存在RestWorkProgress组件", workFlow.buildingId);
                        return true;
                    }
                    const workProgressData = restWorkProgress.getWorkProgress(workFlow.monsterId);
                    if (!workProgressData) {
                        log.error("建筑不存在WorkProgress数据", workFlow.buildingId);
                        return true;
                    }
                    if (workProgressData.progress >= 1) {
                        workFlow.status = WorkStatus.Finished;
                    }
                } else if (baseType == WorkBaseType.Synthetic) {
                    const syntheticWorkProgress = building.getComponent("SyntheticWorkProgress") as SyntheticWorkProgressComponent;
                    if (!syntheticWorkProgress) {
                        log.error("建筑不存在SyntheticWorkProgress组件", workFlow.buildingId);
                        return true;
                    }
                    const workProgressData = syntheticWorkProgress.getWorkProgress(workFlow.monsterId);
                    if (!workProgressData) {
                        log.error("建筑不存在WorkProgress数据", workFlow.buildingId);
                        return true;
                    }
                    if (workProgressData.progress >= 1) {
                        workFlow.status = WorkStatus.Finished;
                    }
                }
                break;
            case WorkStatus.Finished:
                log.info("工作完成", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos);
                return true;
            case WorkStatus.Canceled:
            {
                log.info("工作取消", workFlow.monsterId, workFlow.buildingId, workFlow.hexPos, workFlow.lastStatus);
                if (workFlow.lastStatus == WorkStatus.Moving) {
                    const hexMapNavitation = monster.getComponent("HexMapNavitation") as HexMapNavitationComponent;
                    if (hexMapNavitation) {
                        hexMapNavitation.setState(NavigationState.Finished);
                    }
                } else if (workFlow.lastStatus == WorkStatus.Working) {
                    processStopWork(this.world, workFlow.avatarId, workFlow.spaceId, workFlow.monsterId, workFlow.hexPos, false);
                }
                return true;
            }
        }
        return false;
    }
}