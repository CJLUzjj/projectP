import { Node2D } from "godot";
import { globalMainScene } from "./main";
import { GlobalGameManager } from "../../../../core/Infra/GlobalGameManager";
import { log } from "../../../../core/Interface/Service/LogService";

export default class StartSpace extends Node2D {
	// Called when the node enters the scene tree for the first time.
	_ready(): void {
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {

	}

    _on_start_button_pressed(): void {
		if (globalMainScene == null) {
			return;
		}
		const startNode = globalMainScene.get_node("StartSpace");
		if (startNode) {
			globalMainScene.remove_child(startNode);
		}
		GlobalGameManager.getInstance().startGame();
		log.info("游戏开始");
    }
}