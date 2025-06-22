declare module "godot" {
    interface SceneNodes {
        "src/engine/platform/godot/sence/monster.tscn": {
            AnimatedSprite2D: AnimatedSprite2D<{
                monster_button: Button<{}>;
            }>;
            button_list: MarginContainer<{
                VBoxContainer: VBoxContainer<{
                    start_move: Button<{}>;
                }>;
            }>;
        };
    }
}
