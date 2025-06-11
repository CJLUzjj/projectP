import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { BuildingPropertyComponent, BuildingState } from "../../Component/Property/BuildingPropertyComponent";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";

@System(SystemType.Execute)
export class BuildingStateSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.name = "BuildingState";
        this.addFocusComponent("BuildingProperty");
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const buildingPropertyComponent = entity.getComponent("BuildingProperty") as BuildingPropertyComponent;
            switch (buildingPropertyComponent.getState()) {
                case BuildingState.Init:
                    break;
                case BuildingState.Constructing:
                    break;
                case BuildingState.Constructed:
                    break;
                case BuildingState.Destroyed:
                    break;
            }
        }
    }
}