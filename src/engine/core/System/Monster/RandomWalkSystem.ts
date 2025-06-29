import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { World } from "../../Infra/World";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { MessageComponent } from "../../Component/Input/MessageComponent";
import { MonsterPropertyComponent } from "../../Component/Property/MonsterPropertyComponent";
import { RandomWalkComponent, RandomWalkState } from "../../Component/AI/RandomWalkComponent";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { MovementComponent } from "../../Component/Basic/MovementComponent";
import { HexMapComponent } from "../../Component/Map/HexMapComponent";
import { HexCoord } from "../../Data/MapData";
import { hexToPixel } from "../../Util/Position";
import { HEX_SIZE } from "../../Data/constVal";
import { log } from "../../Interface/Service/LogService";
import { HexMapNavitationComponent, NavigationState } from "../../Component/Map/HexMapNavitationComponent";

@System(SystemType.Execute)
export class RandomWalkSystem extends BaseExcuteSystem {
    constructor(world: World) {
        super(world);
        this.addFocusComponent("MonsterProperty");
        this.addFocusComponent("RandomWalk");
        this.addFocusComponent("Position");
        this.addFocusComponent("Movement");
    }

    execute(entities: BaseEntity[]) {
        for (const entity of entities) {
            const monsterPropertyComponent = entity.getComponent("MonsterProperty") as MonsterPropertyComponent;
            const randomWalkComponent = entity.getComponent("RandomWalk") as RandomWalkComponent;
            const positionComponent = entity.getComponent("Position") as PositionComponent;

            // 检查必要组件是否存在
            if (!monsterPropertyComponent || !randomWalkComponent || !positionComponent) {
                continue;
            }

            if (entity.hasComponent("HexMapNavitation")) {
                const naviComponent = entity.getComponent("HexMapNavitation") as HexMapNavitationComponent;
                if (naviComponent.getVersion() != randomWalkComponent.getNaviVersion()) {
                    continue;
                }
            }

            const currentTime = Date.now();

            // 根据随机游走状态处理
            switch (randomWalkComponent.getState()) {
                case RandomWalkState.Idle:
                    this.handleIdleState(entity, randomWalkComponent, positionComponent, currentTime);
                    break;
                    
                case RandomWalkState.Moving:
                    if (!entity.hasComponent("HexMapNavitation")) {
                        randomWalkComponent.reset(currentTime);
                        break;
                    }
                    const naviComponent = entity.getComponent("HexMapNavitation") as HexMapNavitationComponent;
                    this.handleMovingState(randomWalkComponent, naviComponent, currentTime);
                    break;
                    
                case RandomWalkState.Arrived:
                    this.handleArrivedState(randomWalkComponent, currentTime);
                    break;
            }
        }
    }

    private handleIdleState(entity: BaseEntity, randomWalkComponent: RandomWalkComponent, positionComponent: PositionComponent, currentTime: number): void {
        if (!entity.canAddComponent("HexMapNavitation")) {
            return;
        }

        // 检查是否可以开始新的游走
        if (randomWalkComponent.canStartNewWalk(currentTime)) {
            // 生成随机目标
            const targetCoord = this.generateRandomTarget(randomWalkComponent);
            if (targetCoord) {
                if (entity.hasComponent("HexMapNavitation")) {
                    const naviComponent = entity.getComponent("HexMapNavitation") as HexMapNavitationComponent;
                    naviComponent.reset(positionComponent.getHexCoord(), targetCoord, this.world.getSpaceId());
                } else {
                    entity.addComponent("HexMapNavitation", positionComponent.getHexCoord(), targetCoord, this.world.getSpaceId());
                }
                randomWalkComponent.setTargetHexCoord(targetCoord);
                randomWalkComponent.setState(RandomWalkState.Moving);
                randomWalkComponent.setCurrentWalkTime(currentTime);
                log.info("开始随机游走", targetCoord);
            }
        }
    }

    private handleMovingState(
        randomWalkComponent: RandomWalkComponent, 
        naviComponent: HexMapNavitationComponent,
        currentTime: number
    ): void {
        const targetCoord = randomWalkComponent.getTargetHexCoord();
        if (!targetCoord) {
            randomWalkComponent.setState(RandomWalkState.Idle);
            return;
        }

        // 检查是否游走超时
        if (randomWalkComponent.isWalkTimeout(currentTime)) {
            log.info("随机游走超时，停止移动");
            naviComponent.setState(NavigationState.Finished);
            randomWalkComponent.setState(RandomWalkState.Arrived);
            return;
        }

        if (naviComponent.getState() == NavigationState.Finished) {
            randomWalkComponent.setState(RandomWalkState.Arrived);
            return;
        }
    }

    private handleArrivedState(
        randomWalkComponent: RandomWalkComponent,
        currentTime: number
    ): void {
        
        // 重置状态
        randomWalkComponent.reset(currentTime);
        
        log.info("随机游走完成");
    }

    private generateRandomTarget(randomWalkComponent: RandomWalkComponent): HexCoord | null {
        // 获取当前空间的HexMap组件
        const hexMapComponent = this.getHexMapComponent();
        if (!hexMapComponent) {
            return null;
        }

        // 获取当前实体位置
        const entity = randomWalkComponent.getOwner();
        const positionComponent = entity.getComponent("Position") as PositionComponent;
        if (!positionComponent) {
            return null;
        }

        const currentHexCoord = positionComponent.getHexCoord();
        const walkRadius = randomWalkComponent.getWalkRadius();

        // 尝试生成随机目标，最多尝试10次
        for (let attempt = 0; attempt < 10; attempt++) {
            // 在游走半径内生成随机偏移
            const randomQ = Math.floor(Math.random() * (walkRadius * 2 + 1)) - walkRadius;
            const randomR = Math.floor(Math.random() * (walkRadius * 2 + 1)) - walkRadius;
            
            // 计算目标坐标
            const targetCoord: HexCoord = {
                q: currentHexCoord.q + randomQ,
                r: currentHexCoord.r + randomR
            };

            // 检查目标是否可达
            if (hexMapComponent.canMove(targetCoord)) {
                return targetCoord;
            }
        }

        // 如果无法找到合适的目标，尝试在相邻的六边形中选择一个
        const neighbors = this.getNeighbors(currentHexCoord);
        for (const neighbor of neighbors) {
            if (hexMapComponent.canMove(neighbor)) {
                return neighbor;
            }
        }

        return null;
    }

    private getNeighbors(coord: HexCoord): HexCoord[] {
        // 返回六个方向的邻居
        return [
            { q: coord.q + 1, r: coord.r },     // 右
            { q: coord.q, r: coord.r + 1 },     // 右下
            { q: coord.q - 1, r: coord.r + 1 }, // 左下
            { q: coord.q - 1, r: coord.r },     // 左
            { q: coord.q, r: coord.r - 1 },     // 左上
            { q: coord.q + 1, r: coord.r - 1 }  // 右上
        ];
    }

    private getHexMapComponent(): HexMapComponent | null {
        // 获取当前空间的HexMap组件
        const spaceEntity = this.world.getEntitiesManager().getEntity(this.world.getSpaceId());
        if (spaceEntity) {
            return spaceEntity.getComponent("HexMap") as HexMapComponent;
        }
        return null;
    }
}

