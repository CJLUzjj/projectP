/// <reference path="../../../../../typings/godot3.gen.d.ts" />
import { Node } from "godot";
import { GodotPropertySyncService } from "../service/syncService";
import { setGlobalPropertySyncService } from "../../../core/Interface/Service/PropertySyncService";
import { GlobalGameManager } from "../../../core/Infra/GlobalGameManager";
import Avatar from "./avatar";
import { log } from "../../../core/Interface/Service/LogService";
import { registerComponentToSence } from "../common/instantiation";
import HallSpace from "./hall_space";
import RoomSpace from "./room_space";
import Building from "./building";

export let globalMainScene: Node | null = null;

export default class Main extends Node {
	private worldId: number = 0;

	// Called when the node enters the scene tree for the first time.
	_ready(): void {
		this.init();
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {

	}

	init(): void {
		initSyncService();

		const world = GlobalGameManager.getInstance().createWorld();
		this.worldId = world.getId();

		globalMainScene = this;

		log.info("游戏初始化成功");
	}

	_on_start_button_pressed(): void {
		for (let idx = 0; idx < this.get_child_count(); idx++) {
			const child = this.get_child(idx);
			log.info("remove_child", child.get_name());
			this.remove_child(child);
		}
		GlobalGameManager.getInstance().startGame();
		log.info("游戏开始");
	}

	removeChildren(node: Node): void {
		this.remove_child(node);
	}
}

function initSyncService(): void {
	const propertySyncService = new GodotPropertySyncService();
	setGlobalPropertySyncService(propertySyncService);

	registerComponentToSence("HallProperty", HallSpace.createSence);
	registerComponentToSence("RoomProperty", RoomSpace.createSence);
	registerComponentToSence("AvatarProperty", Avatar.createSence);
	registerComponentToSence("BuildingProperty", Building.createSence);
}