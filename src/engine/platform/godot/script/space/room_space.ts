// <reference path="../../../../../typings/godot7.gen.d.ts" />
import { InputEvent, InputEventMouseButton, MouseButton, Node2D } from "godot";
import { globalMainScene } from "./main";
import { log } from "../../../../core/Interface/Service/LogService";
import { SyncCallback } from "../../service/syncService";
import { instantiate_asset } from "../../common/instantiation";
import { BaseComponent } from "../../../../core/Infra/Base/BaseComponent";
import { globalMessageService, MessageService } from "../../../../core/Interface/Service/MessageService";
import { MessageType } from "../../../../core/Interface/Common/MessageId";
import { globalAvatar } from "../avatar";
import { HexMapComponent } from "../../../../core/Component/Map/HexMapComponent";
import HexMap from "../map/hex_map";

const kRoomSpacePath = "res://src/engine/platform/godot/sence/room_space.tscn";



export default class RoomSpace extends Node2D {
	private entityId: number = 0;
	// Called when the node enters the scene tree for the first time.
	_ready(): void {

	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}

	setEntityId(entityId: number): void {
		this.entityId = entityId;
	}

	getEntityId(): number {
		return this.entityId;
	}

	onComponentChanged(component: BaseComponent): void {
		log.info("RoomSpace onComponentChanged", component.getComponentName());
		if (component.getComponentName() == "HexMap") {
			const hexMap = component as HexMapComponent;
			const hexMapNode = this.get_node("hex_map") as HexMap;
			hexMapNode.updateHexMap(hexMap);
		}
	}

	onComponentAdded(component: BaseComponent): void {
		log.info("RoomSpace onComponentAdded", component.getComponentName());
		if (component.getComponentName() == "HexMap") {
			const hexMap = component as HexMapComponent;
			const hexMapNode = this.get_node("hex_map") as HexMap;
			hexMapNode.updateHexMap(hexMap);
		}
	}

	static createSence(entityId: number, component: BaseComponent): SyncCallback {
		log.info("createSence", entityId, component);
		
		if (globalMainScene == null) {
			log.error("globalMainScene is null");
			return new SyncCallback();
		}
	
		const node = <RoomSpace><unknown>instantiate_asset(kRoomSpacePath, globalMainScene)
		node.set_name("room_space");
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

	addBuilding(q: number, r: number, buildingType: string): void {
		if (globalAvatar == null) {
			log.error("globalAvatar is null");
			return;
		}
		globalMessageService.pushMessage(
			MessageType.ADD_BUILDING,
			{
				avatarId: globalAvatar.getEntityId(),
				spaceId: this.getEntityId(),
				buildingType: buildingType,
				q: q,
				r: r,
			}
		);
	}

	removeBuilding(q: number, r: number): void {
		if (globalAvatar == null) {
			log.error("globalAvatar is null");
			return;
		}
		globalMessageService.pushMessage(
			MessageType.REMOVE_BUILDING,
			{
				avatarId: globalAvatar.getEntityId(),
				spaceId: this.getEntityId(),
				q: q,
				r: r,
			}
		);
	}

	addMonster(q: number, r: number): void {
		if (globalAvatar == null) {
			log.error("globalAvatar is null");
			return;
		}
		globalMessageService.pushMessage(
			MessageType.ADD_MONSTER,
			{
				avatarId: globalAvatar.getEntityId(),
				spaceId: this.getEntityId(),
				monsterType: "Goblin",
				name: "xiaolv",
				level: 1,
				q: q,
				r: r,
			}
		);
	}
}
