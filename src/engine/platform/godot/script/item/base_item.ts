import { Resource, Variant } from "godot";
import { Export } from "godot.annotations";

export default class BaseItem extends Resource {
    @Export(Variant.Type.TYPE_STRING)
    address: string = "somewhere"; // `:string` can be omitted here
    
    @Export(Variant.Type.TYPE_INT)
    age: number = 0; // `:number` can be omitted here
}