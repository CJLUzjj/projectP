import { BaseSystem } from "../Base/System/BaseSystem";
import { BaseInitializeSystem } from "../Base/System/BaseinitializeSystem";
import { BaseCleanSystem } from "../Base/System/BaseCleanSystem";
import { BaseExcuteSystem } from "../Base/System/BaseExcuteSystem";
import { BaseReactiveSystem } from "../Base/System/BaseReactiveSystem";
import { BaseInputSystem } from "../Base/System/BaseInputSystem";

// 系统类型枚举
export enum SystemType {
    Initialize = "initialize",
    Clean = "clean",
    Execute = "execute",
    Reactive = "reactive",
    Input = "input"
}

// 系统注册信息接口
export interface SystemRegistryInfo {
    type: SystemType;
    constructor: new (world: any) => BaseSystem;
    priority?: number; // 可选的优先级，数字越小优先级越高
}

// 全局系统注册表
export class SystemRegistry {
    private static systems: Map<string, SystemRegistryInfo> = new Map();

    static register(name: string, info: SystemRegistryInfo): void {
        this.systems.set(name, info);
    }

    static getAll(): Map<string, SystemRegistryInfo> {
        return this.systems;
    }

    static getByType(type: SystemType): SystemRegistryInfo[] {
        const result: SystemRegistryInfo[] = [];
        for (const [name, info] of this.systems) {
            if (info.type === type) {
                result.push(info);
            }
        }
        // 按优先级排序
        return result.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    }
}

// 系统装饰器
export function System(type: SystemType, priority?: number) {
    return function <T extends new (...args: any[]) => BaseSystem>(constructor: T) {
        const systemName = constructor.name;
        
        // 注册系统
        SystemRegistry.register(systemName, {
            type,
            constructor,
            priority
        });

        return constructor;
    };
}

// 便捷装饰器
export const InitializeSystem = (priority?: number) => System(SystemType.Initialize, priority);
export const CleanSystem = (priority?: number) => System(SystemType.Clean, priority);
export const ExecuteSystem = (priority?: number) => System(SystemType.Execute, priority);
export const ReactiveSystem = (priority?: number) => System(SystemType.Reactive, priority);
export const InputSystem = (priority?: number) => System(SystemType.Input, priority); 