import { HexMapComponent } from "../../../../core/Component/Map/HexMapComponent";
import { MarginContainer, Node2D, Sprite2D, Vector2 } from "godot";
import { instantiate_asset } from "../../common/instantiation";
import HexTile from "./hex_tile";
import RoomSpace from "../space/room_space";
import { HexCoord } from "../../../../core/Data/MapData";
import { hexToPixel } from "../../../../core/Util/Position";
import { HEX_SIZE } from "../../../../core/Data/constVal";
import { log } from "../../../../core/Interface/Service/LogService";
import Monster from "../monster";
import { notify } from "../../../../core/Interface/Service/NotifyService";

const kHexTilePath = "res://src/engine/platform/godot/sence/hex_tile.tscn";
export default class HexMap extends Node2D {
    private hexMap: Map<string, Node2D> = new Map();
    private currentClickedKey: string = "";
    private moveEntityId: number = 0;

	// Called when the node enters the scene tree for the first time.
	_ready(): void {
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	_process(delta: number): void {

	}

    _on_add_building_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            this.onAddBuildingClicked(hexTile, "Farm");
        }
        this.onHexTileClicked(hexTile);
    }

    _on_remove_building_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            this.onRemoveBuildingClicked(hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    _on_add_monster_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            this.onAddMonsterClicked(hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    _on_start_work_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            //this.onStartWorkClicked(hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    _on_stop_work_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            //this.onStopWorkClicked(hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    _on_move_to_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            this.onMoveToClicked(this.moveEntityId, hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    _on_add_obstacle_pressed(): void {
        const hexTile = this.hexMap.get(this.currentClickedKey) as HexTile;
        if (hexTile) {
            this.onAddObstacleClicked(hexTile);
        }
        this.onHexTileClicked(hexTile);
    }

    updateHexMap(hexMap: HexMapComponent): void {
        for (const [key, hexTile] of hexMap.getHexMap()) {
            if (!this.hexMap.has(key)) {
                const hexTileNode = <HexTile><unknown>instantiate_asset(kHexTilePath, this);

                if (hexTileNode) {
                    hexTileNode.key = key;
                    hexTileNode.coord = hexTile.coord;
                    const position = new Vector2(hexTile.position.x, hexTile.position.y);
                    hexTileNode.position = position;
                    if (!hexTile.canMove) {
                        const obstacle = hexTileNode.get_node("obstacle") as Sprite2D;
                        if (obstacle) {
                            obstacle.visible = true;
                        }
                    }
                    this.hexMap.set(key, hexTileNode);
                    log.info("add hex tile", key);
                }
            } else {
                const hexTileNode = this.hexMap.get(key) as HexTile;
                const obstacle = hexTileNode.get_node("obstacle") as Sprite2D;
                if (obstacle) {
                    obstacle.visible = !hexTile.canMove;
                }
            }
        }

        for (const [key, hexTileNode] of this.hexMap) {
            if (!hexMap.getHexMap().has(key)) {
                this.hexMap.delete(key);
                const node = hexTileNode as unknown as Node2D;
                if (node) {
                    this.remove_child(node);
                }
            }
        }
    }

    setListVisible(visible: boolean, hexCoord: HexCoord): void {
        log.info("setListVisible", visible, hexCoord);
        const parent = this.get_parent() as Node2D;
        if (parent) {
            const buttonList = parent.get_node("button_list") as MarginContainer;
            if (buttonList) {
                buttonList.visible = visible;
                const position = hexToPixel(hexCoord, HEX_SIZE);
                log.info("position", position.x, position.y);
                buttonList.position = new Vector2(position.x, position.y);
            }
        }
    }

    onHexTileClicked(hexTile: HexTile): void {
        if (this.currentClickedKey == "") {
            this.currentClickedKey = hexTile.key;
            this.setListVisible(true, hexTile.coord);
        } else {
            if (this.currentClickedKey == hexTile.key) {
                this.currentClickedKey = "";
                this.setListVisible(false, {q: 0, r: 0});
                this.moveEntityId = 0;
            } else {
                this.currentClickedKey = hexTile.key;
                this.setListVisible(true, hexTile.coord);
            }
        }
    }

    onAddBuildingClicked(hexTile: HexTile, buildingType: string): void {
        const roomSpace = this.get_parent() as RoomSpace;
        roomSpace.addBuilding(hexTile.coord.q, hexTile.coord.r, buildingType);
    }

    onRemoveBuildingClicked(hexTile: HexTile): void {
        const roomSpace = this.get_parent() as RoomSpace;
        roomSpace.removeBuilding(hexTile.coord.q, hexTile.coord.r);
    }

    onAddMonsterClicked(hexTile: HexTile): void {
        const roomSpace = this.get_parent() as RoomSpace;
        roomSpace.addMonster(hexTile.coord.q, hexTile.coord.r);
    }

    onMoveToClicked(entityId: number, endHexTile: HexTile): void {
        if (this.moveEntityId == 0) {
            return;
        }
        const roomSpace = this.get_parent() as RoomSpace;
        roomSpace.moveTo(entityId, endHexTile.coord.q, endHexTile.coord.r);
    }

    onAddObstacleClicked(hexTile: HexTile): void {
        const roomSpace = this.get_parent() as RoomSpace;
        roomSpace.addObstacle(hexTile.coord.q, hexTile.coord.r);
    }

    getHexTile(key: string): HexTile | null {
        const hexTile = this.hexMap.get(key) as HexTile;
        if (hexTile) {
            return hexTile;
        }
        return null;
    }

    setMoveEntityId(entityId: number): void {
        this.moveEntityId = entityId;
    }
}