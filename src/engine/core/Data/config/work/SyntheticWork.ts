import { SyntheticWork, WorkType } from "../../../Data/WorkData"
import { JsonMapParser } from "../../../Util/JsonMapParser"

const syntheticWorkData = {
    "Gun": {
        "workType": "Synthetic",
        "baseTime": 30,
        "requiredLevel": 1,
        "stamminaCost": 20,
        "inputs": [
            { "itemId": 1, "quantity": 3},
            { "itemId": 2, "quantity": 1},
            { "itemId": 3, "quantity": 1}
        ],
        "outputs": [
            { "itemId": 17, "quantity": 1}
        ]
    },

    "Sword": {
        "workType": "Synthetic",
        "baseTime": 30,
        "requiredLevel": 1,
        "stamminaCost": 20,
        "inputs": [
            { "itemId": 1, "quantity": 3},
            { "itemId": 2, "quantity": 1},
            { "itemId": 3, "quantity": 1}
        ],
        "outputs": [
            { "itemId": 18, "quantity": 1}
        ]
    }
}

// 合成模板配置
export const SyntheticWorkConfig: Map<WorkType, SyntheticWork> = 
    JsonMapParser.fromJson(syntheticWorkData, {
        keyConverter: (key: string) => WorkType[key as keyof typeof WorkType],
        valueConverter: (value: any, key: string) => ({
            ...value,
            })
        }
    );