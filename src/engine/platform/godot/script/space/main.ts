/// <reference path="../../../../../../typings/godot3.gen.d.ts" />
import { Node, Node2D } from "godot";
import { GodotPropertySyncService } from "../../service/sync_service";
import { setGlobalPropertySyncService } from "../../../../core/Interface/Service/PropertySyncService";
import { GlobalGameManager } from "../../../../core/Infra/GlobalGameManager";
import Avatar from "../avatar";
import { log } from "../../../../core/Interface/Service/LogService";
import { registerComponentToSence } from "../../common/instantiation";
import HallSpace from "./hall_space";
import RoomSpace from "./room_space";
import Building from "../building";
import Monster from "../monster";
import { GodotNotifyService } from "../../service/notify_service";
import { setNotifyService } from "../../../../core/Interface/Service/NotifyService";

export let globalMainScene: MainNode | null = null;

export default class MainNode extends Node {
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
		initNotifyService();
		const world = GlobalGameManager.getInstance().createWorld();
		this.worldId = world.getId();

		globalMainScene = this;

		log.info("游戏初始化成功");
	}

	_on_start_button_pressed(): void {
		const startNode = this.get_node("Start");
		if (startNode) {
			this.remove_child(startNode);
		}
		GlobalGameManager.getInstance().startGame();
		log.info("游戏开始");
	}

	removeChildren(node: Node): void {
		this.remove_child(node);
	}

	getMainGameNode(nodeName: string): Node | null {
		const mainGameNode = this.get_node("MainGame") as Node2D;
		if (mainGameNode == null) {
			log.error("mainGameNode is null");
			return null;
		}
		return mainGameNode.get_node(nodeName) as Node;
	}

	removeMainGameChildNode(nodeName: string): void {
		const mainGameNode = this.get_node("MainGame") as Node2D;
		if (mainGameNode == null) {
			log.error("mainGameNode is null");
			return;
		}
		const childNode = mainGameNode.get_node(nodeName) as Node;
		if (childNode != null) {
			mainGameNode.remove_child(childNode);
		}
	}
}

function initSyncService(): void {
	const propertySyncService = new GodotPropertySyncService();
	setGlobalPropertySyncService(propertySyncService);

	registerComponentToSence("HallProperty", HallSpace.createSence);
	registerComponentToSence("RoomProperty", RoomSpace.createSence);
	registerComponentToSence("AvatarProperty", Avatar.createSence);
	registerComponentToSence("BuildingProperty", Building.createSence);
	registerComponentToSence("MonsterProperty", Monster.createSence);
}

function initNotifyService(): void {
	const notifyService = new GodotNotifyService();
	setNotifyService(notifyService);
}