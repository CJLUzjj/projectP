import { Label } from "godot";
import { NotifyService } from "../../../core/Interface/Service/NotifyService";
import { globalMainScene } from "../script/space/main";

export class GodotNotifyService extends NotifyService {
    notify(message: string, ...args: any[]): void {
        if (globalMainScene == null) {
            return;
        }
        const tip = globalMainScene.get_node("Tips") as Label;
        tip.text = message + " " + args.join(" ");

        setTimeout(() => {
            tip.text = "";
        }, 5000);
    }
}