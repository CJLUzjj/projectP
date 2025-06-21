import { MarginContainer, Node2D } from "godot";
import { log } from "../../../../core/Interface/Service/LogService";
import HexMap from "./hex_map";
import { HexCoord } from "../../../../core/Data/MapData";

export default class HexTile extends Node2D {
    public key: string = "";
    public coord: HexCoord = new HexCoord(0, 0);

	// Called when the node enters the scene tree for the first time.
	_ready(): void {

	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {

	}

    _on_click_button_pressed(): void {
        log.info("hex tile clicked", this.key);
        const hexMap = this.get_parent() as HexMap;
        if (hexMap) {
            hexMap.onHexTileClicked(this);
        }
    }
}