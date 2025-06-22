/// <reference path="../../../../../typings/godot4.gen.d.ts" />
import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { CharacterBody2D, Vector2, AnimatedSprite2D, MarginContainer, Node2D } from "godot";
import { log } from "../../../core/Interface/Service/LogService";
import MainNode, { globalMainScene } from "./space/main";
import { SyncCallback } from "../service/sync_service";
import { instantiate_asset } from "../common/instantiation";
import { PositionComponent } from "../../../core/Component/Basic/PositionComponent";
import HexMap from "./map/hex_map";
import { notify } from "../../../core/Interface/Service/NotifyService";

const kMonsterPath = "res://src/engine/platform/godot/sence/monster.tscn";
export default class Monster extends CharacterBody2D {
	private entityId: number = 0;
	private _cached_pos!: Vector2;
	// Called when the node enters the scene tree for the first time.
	_ready(): void {
		this._cached_pos = new Vector2();
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}

	onComponentChanged(component: BaseComponent): void {
		if (component.getComponentName() == "Position") {
			const positionComponent = component as PositionComponent;
			this._cached_pos.x = positionComponent.getPosition().x;
			this._cached_pos.y = positionComponent.getPosition().y;
			this.updatePosition();
		}
	}

	onComponentAdded(component: BaseComponent): void {
		log.info("Monster onComponentAdded", component.getComponentName());
		if (component.getComponentName() == "Position") {
			const positionComponent = component as PositionComponent;
			log.info("Monster onComponentAdded Position", positionComponent.getPosition().x, positionComponent.getPosition().y);
			this._cached_pos.x = positionComponent.getPosition().x;
			this._cached_pos.y = positionComponent.getPosition().y;
			this.updatePosition();
		}
	}

	updatePosition(): void {
		this.position = this._cached_pos;
	}

	setEntityId(entityId: number): void {
		this.entityId = entityId;
	}

	_on_monster_button_pressed(): void {
		const node = this.get_node("button_list") as MarginContainer;
		if (node) {
			node.visible = !node.visible;
		}
	}

	_on_start_move_pressed(): void {
		const node = globalMainScene?.getMainGameNode("room_space") as Node2D;
		if (node) {
			const hexMap = node.get_node("hex_map") as HexMap;
			if (hexMap) {
				hexMap.setMoveEntityId(this.entityId);
			}
		}
		this.closeButtonList();
	}

	closeButtonList(): void {
		const node = this.get_node("button_list") as MarginContainer;
		if (node) {
			node.visible = false;
		}
	}

	static createSence(entityId: number, component: BaseComponent): SyncCallback {
		log.info("createSence", entityId, component);
		if (globalMainScene == null) {
			log.error("globalMainScene is null");
			return new SyncCallback();
		}

		const node = <Monster><unknown>instantiate_asset(kMonsterPath, globalMainScene)
		node.setEntityId(entityId);
		const animatedSprite2D = node.get_node("AnimatedSprite2D") as AnimatedSprite2D;

		const syncCallback = new SyncCallback();

		syncCallback.addCallback = (component: BaseComponent) => {
			node.onComponentAdded(component);
		}

		syncCallback.syncCallback = (component: BaseComponent) => {
			node.onComponentChanged(component);
		}
	
		syncCallback.removeCallback = () => {
			if (globalMainScene != null) {
				globalMainScene.removeMainGameChildNode("monster");
			}
		}
	
		return syncCallback;
	}
}
