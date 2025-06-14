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

export enum ClickType {
	NONE = "none",
	ADD_BUILDING = "add_building",
	REMOVE_BUILDING = "remove_building",
	ADD_MONSTER = "add_monster",
	REMOVE_MONSTER = "remove_monster",
}

export default class RoomSpace extends Node2D {
	private entityId: number = 0;
	private currentClickType: ClickType = ClickType.NONE;
	private addBuildingPressed: boolean = false;
	private removeBuildingPressed: boolean = false;
	private addMonsterPressed: boolean = false;
	private removeMonsterPressed: boolean = false;
	private isButtonPressed: boolean = false;

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
		this.onClick(ClickType.ADD_BUILDING);
	}

	_on_remove_building_pressed(): void {
		log.info("RoomSpace _on_remove_building_pressed");
		this.onClick(ClickType.REMOVE_BUILDING);
	}

	_on_add_monster_pressed(): void {
		log.info("RoomSpace _on_add_monster_pressed");
		this.onClick(ClickType.ADD_MONSTER);
	}

	_on_remove_monster_pressed(): void {
		log.info("RoomSpace _on_remove_monster_pressed");
		this.onClick(ClickType.REMOVE_MONSTER);
	}

	onClick(clickType: ClickType): void {
		if (clickType == this.currentClickType) {
			this.currentClickType = ClickType.NONE;
		}

		this.currentClickType = clickType;
	}

	// todo: 输入和按钮输入存在优先级，需要处理
	_input(event: InputEvent): void {
		if (event instanceof InputEventMouseButton && event.button_index == 1) { // 1 代表左键

			if (event.pressed && this.currentClickType == ClickType.ADD_BUILDING) {
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
			if (event.pressed && this.currentClickType == ClickType.ADD_MONSTER) {
				if (globalAvatar == null) {
					log.error("globalAvatar is null");
					return;
				}
				log.info("position", event.position.x, event.position.y);
				globalMessageService.pushMessage(
					MessageType.ADD_MONSTER,
					{
						avatarId: globalAvatar.getEntityId(),
						spaceId: this.entityId,
						monsterType: "Globlin",
						name: "Globlin",
						level: 1,
						x: event.position.x,
						y: event.position.y,
					}
				);
			}
		}
	}
}
