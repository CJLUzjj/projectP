import { MonsterIdGenerator } from '../Util/IdGenerator';
import { WorkAbility, WorkType } from './WorkData';
import { MonsterType, PalStatus } from './common';
import { MonsterWorkAbilityConfig } from './config/MonsterWorkAbilityConfig';

export class MonsterBaseProperty {
    constructor(name: string = "",
                type: MonsterType = MonsterType.None,
                level: number = 0,
                hp: number = 0,
                mp: number = 0,
                attack: number = 0,
                defense: number = 0,
                speed: number = 0,
                hit: number = 0,
                attribute: number = 0,
                gender: number = 0,
                isSpecial: boolean = false,
                form: number = 0,
                nature: number = 0,
                experience: number = 0) {
        this.name = name;
        this.type = type;
        this.level = level;
        this.hp = hp;
        this.mp = mp;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.hit = hit;
        this.attribute = attribute;
        this.gender = gender;
        this.isSpecial = isSpecial;
        this.form = form;
        this.nature = nature;
        this.experience = experience;
    }
    name: string;
    type: MonsterType;
    level: number;
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    speed: number;
    hit: number;
    attribute: number;
    gender: number;
    isSpecial: boolean;
    form: number;
    nature: number;
    experience: number;
}

export class MonsterWorkProperty {
    constructor(workAbilities: WorkAbility[] = [],
                stamina: number = 0,
                maxStamina: number = 0,
                workExperience: Map<WorkType, number> = new Map(),
                currentWorkType: WorkType = WorkType.None,
                workStartTime: Date = new Date(),
                assignedBuildingId: number = 0) {
        this.workAbilities = workAbilities;
        this.stamina = stamina;
        this.maxStamina = maxStamina;
        this.workExperience = workExperience;
        this.currentWorkType = currentWorkType;
        this.workStartTime = workStartTime;
        this.assignedBuildingId = assignedBuildingId;
    }
    workAbilities: WorkAbility[];
    stamina: number;
    maxStamina: number;
    workExperience: Map<WorkType, number>;
    currentWorkType: WorkType;
    workStartTime: Date;
    assignedBuildingId: number;
}

export function createMonsterBaseProperty(type: MonsterType, name: string, level: number): MonsterBaseProperty {
    return new MonsterBaseProperty(
        name,
        type,
        level,
        100,
        100,
        10,
        300,
        10,
        10,
        10,
        10,
        false,
        0,
        0,
        0
    );
}

export function createMonsterWorkProperty(type: MonsterType, level: number): MonsterWorkProperty {
    const workAbilities = MonsterWorkAbilityConfig.get(type) || [];

    return new MonsterWorkProperty(
        workAbilities,
        100,
        100,
        new Map(),
        WorkType.None,
        new Date(),
        0
    );
}