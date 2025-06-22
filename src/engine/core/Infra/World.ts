import { EntitiesManager } from "./EntitiesManager";
import { SystemsManager } from "./SystemsManager";
import { log } from "../Interface/Service/LogService";
import { Avatar } from "../Entity/Avatar";
import { HallSpace } from "../Entity/Space/HallSpace";
import { SyncQueue } from "./SyncQueue";

export class World {
    // 用于创建单例component
    private static defaultWorld: World;
    private static worldIdGenerator: number = 1;
    private systemsManager: SystemsManager;
    private entitiesManager: EntitiesManager;
    private syncQueue: SyncQueue;
    private isStart: boolean;
    private isLoad: boolean;
    private currentVirtualTime: number;
    private currentDeltaTime: number;
    private id: number;

    private avatarId: number = 0;
    private spaceId: number = 0;

    constructor(id: number) {
        this.id = id;
        this.systemsManager = new SystemsManager(this);
        this.entitiesManager = new EntitiesManager(this);
        this.syncQueue = new SyncQueue();
        this.isStart = false;
        this.isLoad = false;
        this.currentVirtualTime = 0;
        this.currentDeltaTime = 0;
    }

    public start(): void {
        if (!this.isLoad) {
            this.avatarId = this.getEntitiesManager().createEntity(Avatar).getId();
            this.spaceId = this.getEntitiesManager().createEntity(HallSpace).getId();
        } else {
            for (const entity of this.entitiesManager.getAllEntities()) {
                const entityId = entity.getId();
                const componentMap = entity.getAllComponents();
                for (const [componentName, component] of componentMap) {
                    if (componentName === "AvatarProperty") {
                        this.avatarId = entityId;
                        break;
                    }
                    if (componentName === "HallProperty") {
                        this.spaceId = entityId;
                        break;
                    }
                }
            }
        }

        SystemsManager.registerSystems(this);
        this.systemsManager.start();
        this.isStart = true;

        // 输出系统注册统计信息
        const stats = this.systemsManager.getSystemsStats();
        log.info("世界启动完成，系统统计信息:", stats);

        this.syncQueue.tick();
    }

    public stop(): void {
        this.isStart = false;
    }

    public tick(deltaTime: number): void {
        this.currentDeltaTime = deltaTime;
        this.currentVirtualTime += deltaTime;
        if (!this.isStart) {
            return;
        }
        this.systemsManager.tick();
        this.entitiesManager.tick();
        this.syncQueue.tick();
    }

    public getSystemsManager(): SystemsManager {
        return this.systemsManager;
    }

    public getEntitiesManager(): EntitiesManager {
        return this.entitiesManager;
    }

    public getCurrentVirtualTime(): number {
        return this.currentVirtualTime;
    }

    public getCurrentDeltaTime(): number {
        return this.currentDeltaTime;
    }

    public getId(): number {
        return this.id;
    }

    public getAvatarId(): number {
        return this.avatarId;
    }

    public getSpaceId(): number {
        return this.spaceId;
    }

    public setSpaceId(spaceId: number) {
        this.spaceId = spaceId;
    }

    public getIsLoad(): boolean {
        return this.isLoad;
    }

    public getSyncQueue(): SyncQueue {
        return this.syncQueue;
    }

    static getDefaultWorld(): World {
        if (!this.defaultWorld) {
            this.defaultWorld = new World(0);
        }
        return this.defaultWorld;
    }

    static getWorldId(): number {
        return this.worldIdGenerator;
    }

    static setWorldId(id: number) {
        this.worldIdGenerator = id;
    }

    serialize(): Record<string, any> {
        const serializationData = {
            id: this.id,
            currentVirtualTime: this.currentVirtualTime,
            entities: {} as Record<string, any>,
        }

        serializationData.entities = this.entitiesManager.serialize();
        return serializationData;
    }

    deserialize(data: Record<string, any>) {
        try {
            const serializationData = data;
            this.id = serializationData.id;
            this.currentVirtualTime = serializationData.currentVirtualTime;
            this.entitiesManager.deserialize(serializationData.entities);
            this.isLoad = true;
        } catch (error) {
            console.error('反序列化Entity时发生错误:', error);
            throw new Error(`反序列化失败: ${error}`);
        }
    }
}