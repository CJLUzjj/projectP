import { BaseSystem } from "./Base/System/BaseSystem";
import { BaseInitializeSystem } from "./Base/System/BaseinitializeSystem";
import { World } from "./World";
import { BaseCleanSystem } from "./Base/System/BaseCleanSystem";
import { BaseExcuteSystem } from "./Base/System/BaseExcuteSystem";
import { BaseReactiveSystem } from "./Base/System/BaseReactiveSystem";
import { BaseInputSystem } from "./Base/System/BaseInputSystem";
import { SystemRegistry, SystemType } from "./Decorators/SystemDecorator";
import { log } from "../Interface/Service/LogService";

export class SystemsManager {
    private initializeSystems: BaseInitializeSystem[] = [];
    private cleanSystems: BaseCleanSystem[] = [];
    private excuteSystems: BaseExcuteSystem[] = [];
    private reactiveSystems: BaseReactiveSystem[] = [];
    private inputSystems: BaseInputSystem[] = [];
    private world: World;

    constructor(world: World) {
        this.world = world;
    }

    /**
     * 注册所有使用装饰器标记的系统
     * 这个方法需要在业务层主动调用，确保所有系统类都已经被导入
     */
    public static registerSystems(world: World): void {
        const systemsManager = world.getSystemsManager();
        const allSystems = SystemRegistry.getAll();
        log.info(`开始注册 ${allSystems.size} 个装饰器标记的系统...`);

        // 按类型分组注册系统
        const initializeSystems = SystemRegistry.getByType(SystemType.Initialize);
        const cleanSystems = SystemRegistry.getByType(SystemType.Clean);
        const executeSystems = SystemRegistry.getByType(SystemType.Execute);
        const reactiveSystems = SystemRegistry.getByType(SystemType.Reactive);
        const inputSystems = SystemRegistry.getByType(SystemType.Input);

        // 注册各类型系统
        for (const systemInfo of initializeSystems) {
            systemsManager.createInitializeSystem(systemInfo.constructor as new(world: World) => BaseInitializeSystem);
            log.info(`注册初始化系统: ${systemInfo.constructor.name}`);
        }

        for (const systemInfo of cleanSystems) {
            systemsManager.createCleanSystem(systemInfo.constructor as new(world: World) => BaseCleanSystem);
            log.info(`注册清理系统: ${systemInfo.constructor.name}`);
        }

        for (const systemInfo of executeSystems) {
            systemsManager.createExcuteSystem(systemInfo.constructor as new(world: World) => BaseExcuteSystem);
            log.info(`注册执行系统: ${systemInfo.constructor.name}`);
        }

        for (const systemInfo of reactiveSystems) {
            systemsManager.createReactiveSystem(systemInfo.constructor as new(world: World) => BaseReactiveSystem);
            log.info(`注册响应系统: ${systemInfo.constructor.name}`);
        }

        for (const systemInfo of inputSystems) {
            systemsManager.createInputSystem(systemInfo.constructor as new(world: World) => BaseInputSystem);
            log.info(`注册输入系统: ${systemInfo.constructor.name}`);
        }

        log.info("装饰器系统注册完成!");
    }

    /**
     * 获取已注册的系统统计信息
     */
    public getSystemsStats(): {[key: string]: number} {
        return {
            initialize: this.initializeSystems.length,
            clean: this.cleanSystems.length,
            execute: this.excuteSystems.length,
            reactive: this.reactiveSystems.length,
            input: this.inputSystems.length,
            total: this.initializeSystems.length + this.cleanSystems.length + 
                   this.excuteSystems.length + this.reactiveSystems.length + this.inputSystems.length
        };
    }

    public createInitializeSystem<T extends BaseInitializeSystem>(SystemConstructor: new(world: World) => T): void {
        const system = new SystemConstructor(this.world);
        this.pushSystem(this.initializeSystems, system);
    }

    public createCleanSystem<T extends BaseCleanSystem>(SystemConstructor: new(world: World) => T): void {
        const system = new SystemConstructor(this.world);
        this.pushSystem(this.cleanSystems, system);
    }

    public createExcuteSystem<T extends BaseExcuteSystem>(SystemConstructor: new(world: World) => T): void {
        const system = new SystemConstructor(this.world);
        this.pushSystem(this.excuteSystems, system);
    }
    
    public createReactiveSystem<T extends BaseReactiveSystem>(SystemConstructor: new(world: World) => T): void {
        const system = new SystemConstructor(this.world);
        this.pushSystem(this.reactiveSystems, system);
    }

    public createInputSystem<T extends BaseInputSystem>(SystemConstructor: new(world: World) => T): void {
        const system = new SystemConstructor(this.world);
        this.pushSystem(this.inputSystems, system);
    }

    private pushSystem<T extends BaseSystem>(list: T[], system: T): void {
        if (system.prevSystemsName.length === 0) {
            list.push(system);
            return;
        }
        let markMap = new Map<string, boolean>();
        let index = -1;
        let count = system.prevSystemsName.length;
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < system.prevSystemsName.length; j++) {
                if (list[i].name === system.prevSystemsName[j] && !markMap.has(list[i].name)) {
                    markMap.set(list[i].name, true);
                    count--;
                    break;
                }
            }
            if (count === 0) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.error(`System ${system.name} 没有前置系统在SystemsManager中`, system.prevSystemsName);
        }
        list.splice(index + 1, 0, system);
    }
    

    public start(): void {
        for (const system of this.initializeSystems) {
            system.initialize();
        }
    }

    public tick(): void {
        for (const system of this.inputSystems) {
            const entities = system.getEntities();
            system.processInput(entities);
        }
        for (const system of this.excuteSystems) {
            const entities = system.getEntities();
            system.execute(entities);
        }
        for (const system of this.cleanSystems) {
            system.clean();
        }
    }
}
