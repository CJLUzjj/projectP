declare module "godot" {
    interface SceneNodes {
        "src/engine/platform/godot/sence/avatar.tscn": {
            backpack: Node2D<{
                NinePatchRect: NinePatchRect<{}>;
                close_button: Button<{}>;
            }>;
            backpack_button: Button<{}>;
        };
    }
}
