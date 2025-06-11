import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { Node2D } from "godot";
import { log } from "../../../core/Interface/Service/LogService";
import { globalMainScene } from "./main";
import { SyncCallback } from "../service/syncService";
import { instantiate_asset } from "../common/instantiation";

export let globalAvatar: Avatar | null = null;

const kAvatarPath = "res://src/engine/platform/godot/sence/avatar.tscn";

export default class Avatar extends Node2D {
	private entityId: number = 0;
	// Called when the node enters the scene tree for the first time.
	_ready(): void {
		globalAvatar = this;
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}

	onComponentChanged(component: BaseComponent): void {
		log.info("Avatar onComponentChanged", component.getComponentName());
	}

	onComponentAdded(component: BaseComponent): void {
		log.info("Avatar onComponentAdded", component.getComponentName());
	}

	setEntityId(entityId: number): void {
		this.entityId = entityId;
	}

	getEntityId(): number {
		return this.entityId;
	}

	static createSence(entityId: number, component: BaseComponent): SyncCallback {
		log.info("createSence", entityId, component);
		if (globalMainScene == null) {
			log.error("globalMainScene is null");
			return new SyncCallback();
		}

		const node = <Avatar><unknown>instantiate_asset(kAvatarPath, globalMainScene)
		node.setEntityId(entityId);

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
