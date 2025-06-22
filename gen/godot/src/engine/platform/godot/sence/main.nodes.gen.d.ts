import StartSpace from "../../../../../../../src/engine/platform/godot/script/space/start_space";
declare module "godot" {
    interface SceneNodes {
        "src/engine/platform/godot/sence/main.tscn": {
            StartSpace: StartSpace;
            MainGame: Node2D<{}>;
            Tips: Label<{}>;
            Camera2D: Camera2D<{}>;
        };
    }
}
