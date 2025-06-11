import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { Node2D } from "godot";
import { globalMainScene } from "./main";
import { instantiate_asset } from "../common/instantiation";
import { SyncCallback } from "../service/syncService";
import { log } from "../../../core/Interface/Service/LogService";
import { globalMessageService } from "../../../core/Interface/Service/MessageService";
import { MessageType } from "../../../core/Interface/Common/MessageId";

const kHallSpacePath = "res://src/engine/platform/godot/sence/hall_space.tscn";

export default class HallSpace extends Node2D {
	private entityId: number = 0;

	// Called when the node enters the scene tree for the first time.
	_ready(): void {
		log.info("HallSpace _ready");
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}

	onComponentChanged(component: BaseComponent): void {
		log.info("HallSpace onComponentChanged", component.getComponentName());
	}

	onComponentAdded(component: BaseComponent): void {
		log.info("HallSpace onComponentAdded", component.getComponentName());
	}

	_on_button_pressed(): void {
		globalMessageService.pushMessage(MessageType.ENTER_ROOM, {
			leaveEntityId: this.entityId
		});
		log.info("HallSpace _on_start_button_pressed", this.entityId);
	}

	setEntityId(entityId: number): void {
		this.entityId = entityId;
	}

	static createSence(entityId: number, component: BaseComponent): SyncCallback {
		log.info("createSence", entityId, component);
		
		if (globalMainScene == null) {
			log.error("globalMainScene is null");
			return new SyncCallback();
		}
	
		const node = <HallSpace><unknown>instantiate_asset(kHallSpacePath, globalMainScene)
		node.setEntityId(entityId);
	
		// 根据component的属性，设置node的属性
	
		const syncCallback = new SyncCallback();

		syncCallback.addCallback = (component: BaseComponent) => {
			node.onComponentAdded(component);
		}

		syncCallback.syncCallback = (component: BaseComponent) => {
			node.onComponentChanged(component);
		}
	
		syncCallback.removeCallback = () => {
			if (globalMainScene != null) {
				globalMainScene.remove_child(node);
			}
		}
	
		return syncCallback;
	}
}
