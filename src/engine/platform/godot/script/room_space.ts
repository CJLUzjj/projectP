// <reference path="../../../../../typings/godot7.gen.d.ts" />
import { InputEvent, InputEventMouseButton, MouseButton, Node2D } from "godot";
import { globalMainScene } from "./main";
import { log } from "../../../core/Interface/Service/LogService";
import { SyncCallback } from "../service/syncService";
import { instantiate_asset } from "../common/instantiation";
import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { globalMessageService, MessageService } from "../../../core/Interface/Service/MessageService";
import { MessageType } from "../../../core/Interface/Common/MessageId";
import { globalAvatar } from "./avatar";

const kRoomSpacePath = "res://src/engine/platform/godot/sence/room_space.tscn";

export default class RoomSpace extends Node2D {
	private entityId: number = 0;
	private addBuildingPressed: boolean = false;
	private removeBuildingPressed: boolean = false;

	// Called when the node enters the scene tree for the first time.
	_ready(): void {

	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}

	setEntityId(entityId: number): void {
		this.entityId = entityId;
	}

	onComponentChanged(component: BaseComponent): void {
		log.info("RoomSpace onComponentChanged", component.getComponentName());
	}

	onComponentAdded(component: BaseComponent): void {
		log.info("RoomSpace onComponentAdded", component.getComponentName());
	}

	static createSence(entityId: number, component: BaseComponent): SyncCallback {
		log.info("createSence", entityId, component);
		
		if (globalMainScene == null) {
			log.error("globalMainScene is null");
			return new SyncCallback();
		}
	
		const node = <RoomSpace><unknown>instantiate_asset(kRoomSpacePath, globalMainScene)
		node.setEntityId(entityId);
	
		// 根据component的属性，设置node的属性
	
		const syncCallback = new SyncCallback();
		syncCallback.syncCallback = (component: BaseComponent) => {
			node.onComponentChanged(component);
		}

		syncCallback.addCallback = (component: BaseComponent) => {
			node.onComponentAdded(component);
		}
	
		syncCallback.removeCallback = () => {
			if (globalMainScene != null) {
				globalMainScene.remove_child(node);
			}
		}
	
		return syncCallback;
	}

	_on_add_building_pressed(): void {
		log.info("RoomSpace _on_add_building_pressed");
		if (this.addBuildingPressed) {
			this.addBuildingPressed = false;
		} else {
			this.addBuildingPressed = true;
			this.removeBuildingPressed = false;
		}
	}

	_on_remove_building_pressed(): void {
		log.info("RoomSpace _on_remove_building_pressed");
		if (this.removeBuildingPressed) {
			this.removeBuildingPressed = false;
		} else {
			this.removeBuildingPressed = true;
			this.addBuildingPressed = false;
		}
	}

	_input(event: InputEvent): void {
		if (event instanceof InputEventMouseButton) {
			log.info("RoomSpace _input", event);
			if (event.button_index == MouseButton.MOUSE_BUTTON_LEFT) {
				if (event.pressed && this.addBuildingPressed) {
					if (globalAvatar == null) {
						log.error("globalAvatar is null");
						return;
					}
					log.info("position", event.position.x, event.position.y);
					globalMessageService.pushMessage(
						MessageType.ADD_BUILDING,
						{
							avatarId: globalAvatar.getEntityId(),
							spaceId: this.entityId,
							buildingType: "Farm",
							x: event.position.x,
							y: event.position.y,
						}
					);
				}
			}
		}
	}
}
