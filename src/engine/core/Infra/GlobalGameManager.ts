import "../Component/ComponentLoader";
import "../System/SystemLoader";
import { EntitiesManager } from "./EntitiesManager";
import { CommonConfig } from "../Data/config/CommonConfig";
import { VirtualTime } from "../Util/VirtualTime";
import { World } from "./World";
import { globalSaveGameService, SaveGameService } from "../Interface/Service/SaveGameService";
import { SerializationHelper } from "./SerializationHelper";
import { log } from "../Interface/Service/LogService";
import { buildIndex } from "../System/Utility/Work/Common";

export class GlobalGameManager {
    private static instance: GlobalGameManager;
    private worlds: World[];
    private frame: number;
    private isStart: boolean;
    private gameLoop: ReturnType<typeof setTimeout> | null;

    private constructor() {
        // 初始化游戏管理器
        this.frame = CommonConfig.frame;
        this.isStart = false;
        this.gameLoop = null;
        this.worlds = [];
        this.initialize();
    }

    public static getInstance(): GlobalGameManager {
        if (!GlobalGameManager.instance) {
            GlobalGameManager.instance = new GlobalGameManager();
        }
        return GlobalGameManager.instance;
    }

    public initialize(): void {
        // 游戏管理器初始化
        buildIndex();
    }

    public startGame(): void {
        if (this.isStart) {
            return;
        }

        for (const world of this.worlds) {
            world.start();
        }
        this.isStart = true;

        const targetFrameTime = 1000 / this.frame; // 目标帧时间 (毫秒)
        let lastTickTime = Date.now();
        
        const gameTickLoop = () => {
            if (!this.isStart) {
                return; // 游戏已停止
            }
            
            const currentTime = Date.now();
            const actualDeltaTime = currentTime - lastTickTime; // 实际经过的时间
            
            // 使用实际的时间增量更新虚拟时间
            VirtualTime.getInstance().updateTimeByDelta(actualDeltaTime);
            
            this.worlds.forEach(world => {
                world.tick(actualDeltaTime);
            });
            
            const tickEndTime = Date.now();
            const executionTime = tickEndTime - currentTime;
            
            // 计算下次执行的延迟时间
            const nextDelay = Math.max(0, targetFrameTime - executionTime);
            
            // 更新上次tick时间
            lastTickTime = currentTime;

            //log.info("targetFrameTime", targetFrameTime, "executionTime", executionTime, "nextDelay", nextDelay, "actualDeltaTime", actualDeltaTime);
            
            // 调度下次执行
            this.gameLoop = setTimeout(gameTickLoop, nextDelay);
        };
        
        // 开始第一次执行
        gameTickLoop();
    }

    public stopGame(): void {
        this.isStart = false;
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
    }

    public isStarting(): boolean {
        return this.isStart;
    }

    public createWorld(): World {
        const world = new World(World.getWorldId());
        World.setWorldId(World.getWorldId() + 1);
        this.worlds.push(world);
        return world;
    }

    public getWorlds(): World[] {
        return this.worlds;
    }

    public getWorld(worldId: number): World {
        return this.worlds.find(world => world.getId() === worldId) as World;
    }

    public saveGame(): ArrayBuffer {
        const serializationData = {
            worldIdGenerator: World.getWorldId(),
            worlds: [] as Array<{id: number, data: Record<string, any>}>,
        }
        for (const world of this.worlds) {
            const worldData = world.serialize();
            serializationData.worlds.push({
                id: world.getId(),
                data: worldData,
            });
        }

        const jsonString = SerializationHelper.stringify(serializationData);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonString);

        return bytes;
    }

    public loadGame(bytes: ArrayBuffer): boolean {
        try {
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(bytes);
            const serializationData = SerializationHelper.parse(jsonString) as any;
            World.setWorldId(serializationData.worldIdGenerator);
            for (const world of serializationData.worlds) {
                const worldData = world.data;
                const worldInstance = new World(world.id);
                worldInstance.deserialize(worldData);
                this.worlds.push(worldInstance);
            }
        } catch (error) {
            console.error('加载游戏存档时发生错误:', error);
            return false;
        }
        return true;
    }
}