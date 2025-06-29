import { Node, Node2D, PackedScene, ResourceLoader } from "godot";
import { BaseComponent } from "../../../core/Infra/Base/BaseComponent";
import { SyncCallback } from "../service/sync_service";
import { log } from "../../../core/Interface/Service/LogService";
import { globalMainScene } from "../script/space/main";

// key为组件名
// value为一个创建sence的函数，他的返回值为一个闭包函数，当这个entity被改变时，调用这个闭包函数
export const createSenceMap = new Map<string, (entityId: number, component: BaseComponent) => SyncCallback>();

export function registerComponentToSence(componentName: string, sence: (entityId: number, component: BaseComponent) => SyncCallback) {
    createSenceMap.set(componentName, sence);
}

export function instantiate_asset(path: string, parent: Node, flag: boolean = true): Node | null {
    // 使用ResourceLoader加载tscn文件
    const scene = <PackedScene>ResourceLoader.load(path, "", ResourceLoader.CacheMode.CACHE_MODE_REUSE);
    
    if (scene) {
        // 创建场景实例
        const node = scene.instantiate(PackedScene.GenEditState.GEN_EDIT_STATE_DISABLED);
        
        if (parent == globalMainScene && flag) {
            const mainGameNode = parent.get_node("MainGame");
            if (mainGameNode) {
                mainGameNode.add_child(node, false, Node.InternalMode.INTERNAL_MODE_DISABLED);
            }
        } else {
            parent.add_child(node, false, Node.InternalMode.INTERNAL_MODE_DISABLED);
        }
        return node;
    }
    
    log.error("无法加载场景:", path);
    return null;
}