import { GlobalGameManager } from "../core/Infra/GlobalGameManager";
import { Avatar } from "../core/Entity/Avatar";
import { globalMessageService, setGlobalMessageService } from "../core/Interface/Service/MessageService";
import { MessageService } from "../core/Interface/Service/MessageService";
import { MessageType } from "../core/Interface/Common/MessageId";
import { RoomSpace } from "../core/Entity/Space/RoomSpace";
import { BuildingType } from "../core/Data/common";
import { SystemsManager } from "../core/Infra/SystemsManager";
import { BaseComponent } from "../core/Infra/Base/BaseComponent";
import { setGlobalPropertySyncService, globalPropertySyncService, PropertySyncService } from "../core/Interface/Service/PropertySyncService";
import { Building } from "../core/Entity/Building";
import { BuildingListComponent } from "../core/Component/List/BuildingListComponent";
import { log } from "../core/Interface/Service/LogService";
import { World } from "../core/Infra/World";
import { BaseEntity } from "../core/Infra/Base/BaseEntity";
import { globalSaveGameService } from "../core/Interface/Service/SaveGameService";


let data : Map<number, Map<string, BaseComponent>> = new Map();

class TestPropertySyncService extends PropertySyncService {
    public onAddEntity(entity: BaseEntity): void {
        data.set(entity.getId(), new Map());
        log.info("addEntity", entity.getId());
    }

    public onRemoveEntity(entity: BaseEntity): void {
        data.delete(entity.getId());
        log.info("removeEntity", entity.getId());
    }

    public onSyncComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        }
        // log.info("syncComponent", component.owner.getId(), component.getComponentName());
    }

    public onAddComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        }
        log.info("addComponent", component.owner.getId(), component.getComponentName());
    }

    public onRemoveComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.delete(component.getComponentName());
        }
        log.info("removeComponent", component.owner.getId(), component.getComponentName());
    }
}

function main() {
    const propertySyncService = new TestPropertySyncService();
    setGlobalPropertySyncService(propertySyncService);

    const world = GlobalGameManager.getInstance().createWorld();

    world.start();

    const avatar = world.getEntitiesManager().createEntity(Avatar);
    const space = world.getEntitiesManager().createEntity(RoomSpace);

    GlobalGameManager.getInstance().startGame();

    globalMessageService.pushMessage(MessageType.ADD_BUILDING, {
        avatarId: avatar.getId(),
        spaceId: space.getId(),
        buildingType: BuildingType.Farm
    });

    globalMessageService.pushMessage(MessageType.ADD_BUILDING, {
        avatarId: avatar.getId(),
        spaceId: space.getId(),
        buildingType: BuildingType.Farm
    });

    globalMessageService.pushMessage(MessageType.REMOVE_BUILDING, {
        avatarId: avatar.getId(),
        buildingId: 3
    });

    globalSaveGameService.saveGame();

    const saveGameList = globalSaveGameService.getSaveGameList();
    globalSaveGameService.loadGame(saveGameList[0].filePath);

    globalSaveGameService.saveGame(saveGameList[0].filePath);
}

main();





