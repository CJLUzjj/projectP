/// <reference path="../../../../../typings/godot4.gen.d.ts" />
import { Node2D } from "godot";

export default class Monster extends Node2D {
	// Called when the node enters the scene tree for the first time.
	_ready(): void {
		console.log("Monster ready");
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {
	}
}
