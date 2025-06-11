import { RestWork, WorkType } from "../../../Data/WorkData"
import { JsonMapParser } from "../../../Util/JsonMapParser"

const restWorkData = {
    "Sleep": {
        "workType": "Sleep",
        "baseTime": 10,
        "efficiency": 1.0,
        "requiredLevel": 0,
    },

    "Soak": {
        "workType": "Soak",
        "baseTime": 10,
        "efficiency": 2.0,
        "requiredLevel": 0,
    }
}

// 休息模板配置
export const RestWorkConfig: Map<WorkType, RestWork> = 
    JsonMapParser.fromJson(restWorkData, {
        keyConverter: (key: string) => WorkType[key as keyof typeof WorkType],
        valueConverter: (value: any, key: string) => ({
            stamminaCost: 0,
            ...value,
            })
        }
    );