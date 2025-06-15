import { MonsterType } from '../common';
import { WorkAbility, WorkType } from '../WorkData';
import { JsonMapParser } from '../../Util/JsonMapParser';

// 怪物工作能力配置数据
const monsterWorkConfig = {
    "Goblin": [
        { "workType": "Mining", "efficiency": 75 },
        { "workType": "Transport", "efficiency": 80 },
        { "workType": "Crafting", "efficiency": 60 },
        { "workType": "Rest", "efficiency": 100 },
        { "workType": "Farming", "efficiency": 100 }
    ],
    
    "Orc": [
        { "workType": "Construction", "efficiency": 85 },
        { "workType": "Logging", "efficiency": 90 },
        { "workType": "Guarding", "efficiency": 80 },
        { "workType": "Hunting", "efficiency": 70 },
        { "workType": "Rest", "efficiency": 100 }
    ],
    
    "Troll": [
        { "workType": "Mining", "efficiency": 95 },
        { "workType": "Construction", "efficiency": 90 },
        { "workType": "Transport", "efficiency": 85 },
        { "workType": "Rest", "efficiency": 100 }
    ],
    
    "Dragon": [
        { "workType": "Research", "efficiency": 95 },
        { "workType": "Guarding", "efficiency": 100 },
        { "workType": "Hunting", "efficiency": 90 },
        { "workType": "Crafting", "efficiency": 85 },
        { "workType": "Rest", "efficiency": 100 }
    ],
    
    "Demon": [
        { "workType": "Research", "efficiency": 90 },
        { "workType": "Crafting", "efficiency": 95 },
        { "workType": "Cooking", "efficiency": 80 },
        { "workType": "Guarding", "efficiency": 85 },
        { "workType": "Rest", "efficiency": 100 }
    ],
    
    "Undead": [
        { "workType": "Farming", "efficiency": 85 },
        { "workType": "Cooking", "efficiency": 75 },
        { "workType": "Research", "efficiency": 80 },
        { "workType": "Guarding", "efficiency": 90 },
        { "workType": "Rest", "efficiency": 100 }
    ]
};

// 怪物工作能力模板
export const MonsterWorkAbilityConfig: Map<MonsterType, WorkAbility[]> = JsonMapParser.fromJson<MonsterType, WorkAbility[]>(
    monsterWorkConfig,
    {
        keyConverter: (key: string) => MonsterType[key as keyof typeof MonsterType],
        valueConverter: (value: any[]) => value.map(ability => ({
            workType: WorkType[ability.workType as keyof typeof WorkType],
            efficiency: ability.efficiency
        }))
    }
);