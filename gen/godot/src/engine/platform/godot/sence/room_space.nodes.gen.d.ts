declare module "godot" {
    interface SceneNodes {
        "src/engine/platform/godot/sence/room_space.tscn": {
            ColorRect: ColorRect<{}>;
            hex_map: Node2D<{}>;
            button_list: MarginContainer<{
                VBoxContainer: VBoxContainer<{
                    add_building: Button<{}>;
                    remove_building: Button<{}>;
                    start_work: Button<{}>;
                    stop_work: Button<{}>;
                    add_monster: Button<{}>;
                    move_to: Button<{}>;
                    add_obstacle: Button<{}>;
                }>;
            }>;
            Camera2D: Camera2D<{}>;
        };
    }
}
