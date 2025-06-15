import { globalMessageService } from "../../../../core/Interface/Service/MessageService";
import { Node, InputEvent, InputEventMouseButton } from "godot";
import { log } from "../../../../core/Interface/Service/LogService";
import { globalAvatar } from "../avatar";
import { MessageType } from "../../../../core/Interface/Common/MessageId";
import RoomSpace, { ClickType } from "../space/room_space";

export default class RoomInput extends Node {
    _ready(): void {
        log.info("RoomInput _ready");
    }

    _process(delta: number): void {
    }

	// todo: 输入和按钮输入存在优先级，需要处理，比如把input挂在按钮下方
	_input(event: InputEvent): void {
		if (event instanceof InputEventMouseButton && event.button_index == 1) { // 1 代表左键
            const roomSpace = this.get_parent() as RoomSpace;

			if (event.pressed && roomSpace.getCurrentClickType() == ClickType.ADD_BUILDING) {
				if (globalAvatar == null) {
					log.error("globalAvatar is null");
					return;
				}
				log.info("position", event.position.x, event.position.y);
				globalMessageService.pushMessage(
					MessageType.ADD_BUILDING,
					{
						avatarId: globalAvatar.getEntityId(),
						spaceId: roomSpace.getEntityId(),
						buildingType: "Farm",
						x: event.position.x,
						y: event.position.y,
					}
				);
			}
			if (event.pressed && roomSpace.getCurrentClickType() == ClickType.ADD_MONSTER) {
				if (globalAvatar == null) {
					log.error("globalAvatar is null");
					return;
				}
				log.info("position", event.position.x, event.position.y);
				globalMessageService.pushMessage(
					MessageType.ADD_MONSTER,
					{
						avatarId: globalAvatar.getEntityId(),
						spaceId: roomSpace.getEntityId(),
						monsterType: "Globlin",
						name: "Globlin",
						level: 1,
						x: event.position.x,
						y: event.position.y,
					}
				);
			}

            roomSpace.setCurrentClickType(ClickType.NONE);
		}
	}
}