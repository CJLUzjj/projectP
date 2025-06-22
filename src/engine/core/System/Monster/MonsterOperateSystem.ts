import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { World } from "../../Infra/World";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { MessageParams, MessageType } from "../../Interface/Common/MessageId";
import { MonsterType } from "../../Data/common";
import { addDefaultMonster } from "../Utility/Monster/CreateMonster";
import { Monster } from "../../Entity/Monster";
import { MonsterPropertyComponent } from "../../Component/Property/MonsterPropertyComponent";
import { MonsterListComponent } from "../../Component/List/MonsterListComponent";
import { log } from "../../Interface/Service/LogService";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { HexMapComponent } from "../../Component/Map/HexMapComponent";

@System(SystemType.Execute)
export class MonsterOperateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "MonsterOperate";
        this.prevSystemsName = [];
        this.addFocusComponent("Message");
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const messageComponent = entity.getComponent("Message") as MessageComponent;
            if (messageComponent) {
                this.processAddMonster(messageComponent);
                this.processRemoveMonster(messageComponent);
            }
        }
    }

    private processAddMonster(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.ADD_MONSTER);
            if (!message) {
                break;
            }
            // log.info("processAddMonster", message);
            const params = message.args as MessageParams[MessageType.ADD_MONSTER];
            const avatarId = params.avatarId;
            const spaceId = params.spaceId;
            const monsterType = params.monsterType as MonsterType;
            const name = params.name;
            const level = params.level;

            // todo 检查是否可以添加怪物（空间限制、资源消耗等）

            const space = this.world.getEntitiesManager().getEntity(spaceId);
            if (!space) {
                log.info("空间不存在", spaceId);
                continue;
            }

            const monster = this.world.getEntitiesManager().createEntity(Monster);
            if (monster.hasComponent("MonsterProperty")) {
                const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
                const monsterData = addDefaultMonster(monsterType, name, level, avatarId.toString());
                // 复制数据到实际的组件中
                monsterPropertyComponent.baseProperty = monsterData.baseProperty;
                monsterPropertyComponent.workProperty = monsterData.workProperty;
                monsterPropertyComponent.masterId = monsterData.masterId;
                monsterPropertyComponent.status = monsterData.status;
                monster.addComponent("Movement", monsterPropertyComponent.baseProperty.speed);
            }
            if (monster.hasComponent("Position")) {
                const positionComponent = monster.getComponent("Position") as PositionComponent;
                const hexMapComponent = space.getComponent("HexMap") as HexMapComponent;
                if (!hexMapComponent) {
                    log.info("空间不存在HexMap组件", spaceId);
                    continue;
                }
                positionComponent.setHexCoord(params.q, params.r);
            }

            monster.addComponent("Owner", avatarId);

            // if (space.hasComponent("MonsterList")) {
            //     const monsterListComponent = space.getComponent("MonsterList") as MonsterListComponent;
            //     monsterListComponent.addMonster(monster.getId().toString());
            // }

            const avatar = this.world.getEntitiesManager().getEntity(avatarId);
            if (!avatar) {
                log.info("avatar不存在", avatarId);
                continue;
            }
            if (avatar.hasComponent("MonsterList")) {
                const monsterListComponent = avatar.getComponent("MonsterList") as MonsterListComponent;
                monsterListComponent.addMonster(monster.getId().toString());
            }

            log.info("monster add success", monster.getId());
        }
    }

    private processRemoveMonster(messageComponent: MessageComponent) {
        while (true) {
            const message = messageComponent.popMessage(MessageType.REMOVE_MONSTER);
            if (!message) {
                break;
            }
            const params = message.args as MessageParams[MessageType.REMOVE_MONSTER];
            const avatarId = params.avatarId;
            const monsterId = params.monsterId;

            const monster = this.world.getEntitiesManager().getEntity(monsterId);
            if (!monster) {
                log.info("怪物不存在", monsterId);
                continue;
            }
            if (monster.hasComponent("MonsterProperty")) {
                const monsterPropertyComponent = monster.getComponent("MonsterProperty") as MonsterPropertyComponent;
                if (monsterPropertyComponent.masterId !== avatarId.toString()) {
                    log.info("不是自己的怪物", monsterId, avatarId);
                    continue;
                }

                // // 从怪物列表中移除
                // const spaces = this.world.getEntitiesManager().getAllEntities();
                // for (const space of spaces) {
                //     if (space.hasComponent("MonsterList")) {
                //         const monsterListComponent = space.getComponent("MonsterList") as MonsterListComponent;
                //         monsterListComponent.removeMonster(monsterId.toString());
                //     }
                // }

                const avatar = this.world.getEntitiesManager().getEntity(avatarId);
                if (avatar && avatar.hasComponent("MonsterList")) {
                    const monsterListComponent = avatar.getComponent("MonsterList") as MonsterListComponent;
                    monsterListComponent.removeMonster(monsterId.toString());
                } else {
                    log.info("avatar不存在", avatarId);
                }

                // 删除怪物实体
                this.world.getEntitiesManager().removeEntity(monsterId);
                log.info("monster remove success", monsterId);
            }
        }
    }
}