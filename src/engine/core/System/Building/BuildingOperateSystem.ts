import { World } from "../../Infra/World";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MessageParams, MessageType } from "../../Interface/Common/MessageId";
import { BuildingType } from "../../Data/common";
import { log } from "../../Interface/Service/LogService";
import { addBuilding } from "../Utility/Building/Common";
import { HexMapComponent } from "../../Component/Map/HexMapComponent";
import { notify } from "../../Interface/Service/NotifyService";

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
                this.processAddObstacle(messageComponent);
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
            const q = params.q;
            const r = params.r;

            if (addBuilding(this.world, avatarId, spaceId, buildingType, q, r)) {
                log.info("building add success", buildingType, q, r);
                notify.notify(`建筑${buildingType}建造成功`);
            } else {
                log.info("building add failed", buildingType, q, r);
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
            const spaceId = params.spaceId;
            const q = params.q;
            const r = params.r;

            const space = this.world.getEntitiesManager().getEntity(spaceId);
            if (!space) {
                log.info("空间不存在", spaceId);
                continue;
            }

            const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
            if (!hexMapComponent) {
                log.info("空间不存在HexMap组件", spaceId);
                continue;
            }

            const hexTile = hexMapComponent.getHexAt({ q, r });
            if (!hexTile) {
                log.info("位置不存在HexTile", q, r);
                continue;
            }

            const buildingId = hexTile.entityId;
            this.world.getEntitiesManager().removeEntity(buildingId);
            hexTile.entityId = 0;
        }
    }

    private processAddObstacle(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.ADD_OBSTACLE);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.ADD_OBSTACLE];
            const avatarId = params.avatarId;
            const spaceId = params.spaceId;
            const q = params.q;
            const r = params.r;
            
            const space = this.world.getEntitiesManager().getEntity(spaceId);
            if (!space) {
                log.info("空间不存在", spaceId);
                continue;
            }

            const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
            if (!hexMapComponent) {
                log.info("空间不存在HexMap组件", spaceId);
                continue;
            }

            const hexTile = hexMapComponent.getHexAt({ q, r });
            if (!hexTile) {
                log.info("位置不存在HexTile", q, r);
                continue;
            }

            if (hexTile.entityId != 0) {
                log.info("位置已有实体", q, r);
                continue;
            }

            if (hexTile.canMove) {
                hexTile.canMove = false;
                notify.notify(`障碍添加成功`);
            } else {
                hexTile.canMove = true;
                notify.notify(`障碍移除成功`);
            }
            hexMapComponent.setDirty();
        }
    }
}
