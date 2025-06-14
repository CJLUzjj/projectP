import { World } from "../../Infra/World";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { ProcessBuildingComponent } from "../../Component/Process/ProcessBuildingComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { addDefaultBuilding } from "../Utility/Building/CreateBuilding";
import { Building } from "../../Entity/Building";
import { BuildingPropertyComponent, BuildingState } from "../../Component/Property/BuildingPropertyComponent";
import { BuildingListComponent } from "../../Component/List/BuildingListComponent";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MessageParams, MessageType } from "../../Interface/Common/MessageId";
import { BuildingType } from "../../Data/common";
import { log } from "../../Interface/Service/LogService";
import { PositionComponent } from "../../Component/PositionComponent";
import { addBuilding } from "../Utility/Building/Common";

@System(SystemType.Execute)
export class BuildingOperateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "BuildingOperate";
        this.addFocusComponent("Message");
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const messageComponent = entity.getComponent("Message") as MessageComponent;
            if (messageComponent) {
                this.processAddBuilding(messageComponent);
                this.processRemoveBuilding(messageComponent);
            }
        }
    }

    private processAddBuilding(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.ADD_BUILDING);
            if (!message) {
                break;
            }
            log.info("processAddBuilding", message);
            const params = message.args as MessageParams[MessageType.ADD_BUILDING];
            const avatarId = params.avatarId;
            const spaceId = params.spaceId;
            const buildingType = params.buildingType as BuildingType;
            const x = params.x;
            const y = params.y;

            if (addBuilding(this.world, avatarId, spaceId, buildingType, x, y)) {
                log.info("building add success", buildingType, x, y);
            } else {
                log.info("building add failed", buildingType, x, y);
            }
        }
    }

    private processRemoveBuilding(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.REMOVE_BUILDING);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.REMOVE_BUILDING];
            const avatarId = params.avatarId;
            const buildingId = params.buildingId;

            const building = this.world.getEntitiesManager().getEntity(buildingId);
            if (!building) {
                log.info("建筑不存在", buildingId);
                continue;
            }
            if (building.hasComponent("BuildingProperty")) {
                const buildingPropertyComponent = building.getComponent("BuildingProperty") as BuildingPropertyComponent;
                if (buildingPropertyComponent.getOwnerId() !== avatarId) {
                    log.info("不是自己的建筑", buildingId, avatarId);
                    continue;
                }

                // if (buildingPropertyComponent.getState() !== BuildingState.Constructed && 
                //     buildingPropertyComponent.getState() !== BuildingState.Constructing) {
                //     log.info("建筑状态不正确", buildingId, avatarId);
                //     continue;
                // }

                // todo: 直接把entity删除好像也可以？
                // buildingPropertyComponent.setState(BuildingState.Destroyed);
                this.world.getEntitiesManager().removeEntity(buildingId);
            }
        }
    }
}
