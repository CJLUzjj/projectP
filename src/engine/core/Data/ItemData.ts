import { ItemType } from "./common";

export class ItemIndex {
    constructor(id: number) {
        this.id = id;
    }
    id: number;
}

export class ItemData {
    constructor(id: number, name: string, type: ItemType, rarity: number, value: number, description: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.value = value;
        this.description = description;
    }
    id: number;
    name: string;
    type: ItemType;
    rarity: number;
    value: number;
    description: string;
    
    getId(): string {
        return this.id.toString();
    }
}