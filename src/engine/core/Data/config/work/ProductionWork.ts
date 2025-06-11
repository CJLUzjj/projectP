import { WorkType, ProductionWork } from "../../../Data/WorkData";
import { JsonMapParser } from "../../../Util/JsonMapParser";

const productionWorkData = {
    "Mining": {
        "workType": "Mining",
        "baseTime": 30,
        "requiredLevel": 1,
        "stamminaCost": 20,
        "outputs": [
            { "itemId": 1, "quantity": 3},
            { "itemId": 2, "quantity": 1},
            { "itemId": 3, "quantity": 1}
        ]
    },
    
    "Logging": {
        "workType": "Logging",
        "baseTime": 24,
        "requiredLevel": 1,
        "stamminaCost": 15,
        "outputs": [
            { "itemId": 4, "quantity": 4},
            { "itemId": 5, "quantity": 2}
        ]
    },
    
    "Farming": {
        "workType": "Farming",
        "baseTime": 20,
        "requiredLevel": 2,
        "stamminaCost": 25,
        "outputs": [
            { "itemId": 6, "quantity": 5},
            { "itemId": 7, "quantity": 2},
            { "itemId": 8, "quantity": 1}
        ]
    }
}

// 生产模板配置
export const ProductionWorkConfig: Map<WorkType, ProductionWork> = 
    JsonMapParser.fromJson(productionWorkData, {
        keyConverter: (key: string) => WorkType[key as keyof typeof WorkType],
        valueConverter: (value: any, key: string) => ({
            ...value,
            })
        }
    );