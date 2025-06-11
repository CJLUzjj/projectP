import { BuildingWork, WorkType } from "../../../Data/WorkData";
import { JsonMapParser } from "../../../Util/JsonMapParser";

const buildingWorkData = {
    "Farm": {
        "workType": "Building",
        "baseTime": 30,
        "requiredLevel": 1,
        "stamminaCost": 20,
        "inputs": [
            { "itemId": 1, "quantity": 3}
        ],
        "buildingType": "Farm"
    }
};

// 建造模板配置
export const BuildingWorkConfig: Map<WorkType, BuildingWork> = 
    JsonMapParser.fromJson(buildingWorkData, {
        keyConverter: (key: string) => WorkType[key as keyof typeof WorkType],
        valueConverter: (value: any, key: string) => ({
            ...value,
            })
        }
    );