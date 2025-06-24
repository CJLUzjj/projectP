import { HexMapComponent } from "../../Component/Map/HexMapComponent";
import { System, SystemType } from "../../Infra/Decorators/SystemDecorator";
import { BaseExcuteSystem } from "../../Infra/Base/System/BaseExcuteSystem";
import { World } from "../../Infra/World";
import { BaseEntity } from "../../Infra/Base/BaseEntity";
import { HexMapNavitationComponent, NavigationState, PathNode } from "../../Component/Map/HexMapNavitationComponent";
import { MovementComponent } from "../../Component/Basic/MovementComponent";
import { PositionComponent } from "../../Component/Basic/PositionComponent";
import { HexCoord } from "../../Data/MapData";
import { hexToPixel } from "../../Util/Position";
import { log } from "../../Interface/Service/LogService";
import { HEX_SIZE } from "../../Data/constVal";
import { notify } from "../../Interface/Service/NotifyService";

@System(SystemType.Execute)
export class HexMapNavigationSystem extends BaseExcuteSystem {

    constructor(world: World) {
        super(world);
        this.name = "HexMapNavigation";
        this.prevSystemsName = [];
        this.addFocusComponent("HexMapNavitation");
        this.addFocusComponent("Movement");
        this.addFocusComponent("Position");
    }

    execute(entities: BaseEntity[]): void {
        for (const entity of entities) {
            const hexMapNavitationComponent = entity.getComponent("HexMapNavitation") as HexMapNavitationComponent;
            const movementComponent = entity.getComponent("Movement") as MovementComponent;
            const positionComponent = entity.getComponent("Position") as PositionComponent;
            
            if (!hexMapNavitationComponent || !movementComponent || !positionComponent) {
                continue;
            }

            // 根据导航状态处理
            switch (hexMapNavitationComponent.getState()) {
                case NavigationState.Idle:
                    // 空闲状态，开始计算路径
                    this.startPathfinding(hexMapNavitationComponent, positionComponent);
                    break;
                    
                case NavigationState.Calculating:
                    // 计算路径中，执行A*算法
                    this.calculatePath(hexMapNavitationComponent);
                    break;
                    
                case NavigationState.Moving:
                    // 移动中，控制移动
                    this.controlMovement(hexMapNavitationComponent, movementComponent, positionComponent);
                    break;
                    
                case NavigationState.Arrived:
                    // 已到达，停止移动
                    this.handleArrival(hexMapNavitationComponent, movementComponent);
                    break;
                    
                case NavigationState.Failed:
                    // 路径计算失败，重置状态
                    this.handlePathfindingFailure(hexMapNavitationComponent, movementComponent);
                    break;
            }
        }
    }

    private startPathfinding(navComponent: HexMapNavitationComponent, positionComponent: PositionComponent): void {
        // 获取当前六边形坐标
        const currentHexCoord = positionComponent.getHexCoord();
        navComponent.setCurrentHexCoord(currentHexCoord);
        
        // 检查目标是否可达
        const hexMapComponent = this.getHexMapComponent();
        if (!hexMapComponent) {
            navComponent.setState(NavigationState.Failed);
            return;
        }

        if (!hexMapComponent.canMove(navComponent.getTargetHexCoord())) {
            log.warn("目标位置不可达", navComponent.getTargetHexCoord());
            navComponent.setState(NavigationState.Failed);
            return;
        }

        // 开始计算路径
        navComponent.setState(NavigationState.Calculating);
        log.info("开始路径寻找", currentHexCoord, "->", navComponent.getTargetHexCoord());
    }

    private calculatePath(navComponent: HexMapNavitationComponent): void {
        const hexMapComponent = this.getHexMapComponent();
        if (!hexMapComponent) {
            navComponent.setState(NavigationState.Failed);
            return;
        }

        // 执行A*算法
        const path = this.aStarPathfinding(
            hexMapComponent,
            navComponent.getCurrentHexCoord(),
            navComponent.getTargetHexCoord()
        );

        if (path && path.length > 0) {
            navComponent.setPath(path);
            navComponent.setState(NavigationState.Moving);
            log.info("路径计算完成", path.length, "个节点");
        } else {
            navComponent.setState(NavigationState.Failed);
            log.warn("无法找到路径");
        }
    }

    private controlMovement(navComponent: HexMapNavitationComponent, movementComponent: MovementComponent, positionComponent: PositionComponent): void {
        const nextTarget = navComponent.getNextTarget();
        if (!nextTarget) {
            navComponent.setState(NavigationState.Arrived);
            return;
        }

        // 获取当前位置和目标位置
        const currentPos = positionComponent.getPosition();
        const targetPos = hexToPixel(nextTarget, HEX_SIZE); // 使用HEX_SIZE

        // 计算方向向量
        const directionX = targetPos.x - currentPos.x;
        const directionY = targetPos.y - currentPos.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);

        // 添加调试日志
        const currentIndex = navComponent.getCurrentPathIndex();
        const pathLength = navComponent.getPath().length;

        // 如果已经接近目标点，移动到下一个路径点
        if (distance < 5) { // 容差
            // 移动到下一个路径点
            const hasMorePoints = navComponent.moveToNextPathPoint();
            
            // 如果没有更多路径点，说明已经到达最终目标
            if (!hasMorePoints) {
                navComponent.setState(NavigationState.Arrived);
                return;
            }
        }

        // 标准化方向向量并设置移动
        if (distance > 0) {
            const normalizedX = directionX / distance;
            const normalizedY = directionY / distance;
            movementComponent.setDirection({ x: normalizedX, y: normalizedY });
        }
    }

    private handleArrival(navComponent: HexMapNavitationComponent, movementComponent: MovementComponent): void {
        // 停止移动
        movementComponent.setDirection({ x: 0, y: 0 });
        log.info("已到达目标位置");
        notify.notify("已到达目标位置");

        // const entity = navComponent.getOwner();
        // if (entity) {
        //     entity.removeComponent("HexMapNavitation");
        // }
        
        // 可以在这里添加到达目标后的逻辑
        // 比如触发事件、播放动画等
    }

    private handlePathfindingFailure(navComponent: HexMapNavitationComponent, movementComponent: MovementComponent): void {
        // 停止移动
        movementComponent.setDirection({ x: 0, y: 0 });
        log.warn("路径寻找失败");
        notify.notify("路径寻找失败");

        // const entity = navComponent.getOwner();
        // if (entity) {
        //     entity.removeComponent("HexMapNavitation");
        // }
    }

    private getHexMapComponent(): HexMapComponent | null {
        // 获取当前空间的HexMap组件
        // 这里假设HexMap组件在空间实体上
        const spaceEntity = this.world.getEntitiesManager().getEntity(this.world.getSpaceId());
        if (spaceEntity) {
            return spaceEntity.getComponent("HexMap") as HexMapComponent;
        }
        return null;
    }

    private aStarPathfinding(hexMapComponent: HexMapComponent, start: HexCoord, target: HexCoord): HexCoord[] {
        const openSet = new Map<string, PathNode>();
        const closedSet = new Set<string>();
        
        // 创建起始节点
        const startNode: PathNode = {
            coord: start,
            g: 0,
            h: this.heuristic(start, target),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        
        openSet.set(this.coordToKey(start), startNode);
        
        while (openSet.size > 0) {
            // 找到f值最小的节点
            let currentNode: PathNode | null = null;
            let minF = Infinity;
            
            for (const node of openSet.values()) {
                if (node.f < minF) {
                    minF = node.f;
                    currentNode = node;
                }
            }
            
            if (!currentNode) break;
            
            const currentKey = this.coordToKey(currentNode.coord);
            
            // 检查是否到达目标
            if (currentNode.coord.q === target.q && currentNode.coord.r === target.r) {
                return this.reconstructPath(currentNode);
            }
            
            // 将当前节点从开放集移到关闭集
            openSet.delete(currentKey);
            closedSet.add(currentKey);
            
            // 检查所有邻居
            const neighbors = this.getNeighbors(currentNode.coord);
            for (const neighborCoord of neighbors) {
                const neighborKey = this.coordToKey(neighborCoord);
                
                // 如果邻居在关闭集中，跳过
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                // 检查邻居是否可移动
                if (!hexMapComponent.canMove(neighborCoord)) {
                    continue;
                }
                
                const tentativeG = currentNode.g + 1; // 每个六边形的代价为1
                
                let neighborNode = openSet.get(neighborKey);
                if (!neighborNode) {
                    // 创建新节点
                    neighborNode = {
                        coord: neighborCoord,
                        g: tentativeG,
                        h: this.heuristic(neighborCoord, target),
                        f: 0,
                        parent: currentNode
                    };
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openSet.set(neighborKey, neighborNode);
                } else if (tentativeG < neighborNode.g) {
                    // 找到更好的路径
                    neighborNode.g = tentativeG;
                    neighborNode.f = tentativeG + neighborNode.h;
                    neighborNode.parent = currentNode;
                }
            }
        }
        
        // 没有找到路径
        return [];
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

    private heuristic(a: HexCoord, b: HexCoord): number {
        // 六边形距离启发式函数
        return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
    }

    private reconstructPath(endNode: PathNode): HexCoord[] {
        const path: HexCoord[] = [];
        let currentNode: PathNode | null = endNode;
        
        while (currentNode) {
            path.unshift(currentNode.coord);
            currentNode = currentNode.parent;
        }
        
        return path;
    }

    private coordToKey(coord: HexCoord): string {
        return `${coord.q},${coord.r}`;
    }
}