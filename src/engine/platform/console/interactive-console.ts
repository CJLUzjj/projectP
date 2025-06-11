/// <reference types="node" />
import * as readline from 'readline';
import { GlobalGameManager } from "../../core/Infra/GlobalGameManager";
import { Avatar } from "../../core/Entity/Avatar";
import { globalMessageService } from "../../core/Interface/Service/MessageService";
import { MessageType } from "../../core/Interface/Common/MessageId";
import { RoomSpace } from "../../core/Entity/Space/RoomSpace";
import { BuildingType, MonsterType } from "../../core/Data/common";
import { WorkType } from "../../core/Data/WorkData";
import { BaseComponent } from "../../core/Infra/Base/BaseComponent";
import { setGlobalPropertySyncService, globalPropertySyncService, PropertySyncService } from "../../core/Interface/Service/PropertySyncService";
import { BuildingListComponent } from "../../core/Component/List/BuildingListComponent";
import { MonsterListComponent } from "../../core/Component/List/MonsterListComponent";
import { log } from "../../core/Interface/Service/LogService";
import { BaseEntity } from "../../core/Infra/Base/BaseEntity";
import { globalSaveGameService } from "../../core/Interface/Service/SaveGameService";

// 全局数据存储，用于测试和查询
let data: Map<number, Map<string, BaseComponent>> = new Map();

// 测试用的PropertySyncService实现
class TestPropertySyncService extends PropertySyncService {
    public onAddEntity(entity: BaseEntity): void {
        data.set(entity.getId(), new Map());
        log.info("addEntity", entity.getId());
    }

    public onRemoveEntity(entity: BaseEntity): void {
        data.delete(entity.getId());
        log.info("removeEntity", entity.getId());
    }

    public onSyncComponent(component: BaseComponent) {
        log.info("syncComponent", component.owner.getId(), component.getComponentName());
    }

    public onAddComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.set(component.getComponentName(), component);
        }
        log.info("addComponent", component.owner.getId(), component.getComponentName());
    }

    public onRemoveComponent(component: BaseComponent) {
        const entityId = component.owner.getId();
        const componentMap = data.get(entityId);
        if (componentMap) {
            componentMap.delete(component.getComponentName());
        }
        log.info("removeComponent", component.owner.getId(), component.getComponentName());
    }
}

class InteractiveGameConsole {
    private rl: readline.Interface;
    private worldId: number = 0;
    private spaceId: number = 0;
    private avatarId: number = 0;
    private propertySyncService: TestPropertySyncService;
    private gameStarted: boolean = false;
    private isInit: boolean = false;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🎮 游戏控制台> '
        });

        this.propertySyncService = new TestPropertySyncService();
        setGlobalPropertySyncService(this.propertySyncService);
    }

    start(): void {
        log.info("🎮 欢迎使用游戏交互控制台！");
        log.info("=".repeat(50));
        this.showHelp();
        log.info("");
        
        this.rl.prompt();
        
        this.rl.on('line', (input) => {
            this.handleCommand(input.trim());
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            log.info('\n👋 再见！');
            process.exit(0);
        });
    }

    private handleCommand(input: string): void {
        const [command, ...args] = input.split(' ');

        try {
            switch (command.toLowerCase()) {
                case 'help':
                case 'h':
                    this.showHelp();
                    break;
                
                case 'init':
                    this.initializeGame();
                    break;
                
                case 'start':
                    this.startGame();
                    break;
                
                case 'data':
                    this.showData();
                    break;
                
                case 'query':
                    this.queryData(args);
                    break;
                
                case 'addbuilding':
                    this.addBuilding(args[0]);
                    break;
                
                case 'removebuilding':
                    this.removeBuilding(args[0]);
                    break;
                
                case 'addmonster':
                    this.addMonster(args[0], args[1], args[2]);
                    break;
                
                case 'removemonster':
                    this.removeMonster(args[0]);
                    break;
                
                case 'startwork':
                    this.startWork(args[0], args[1], args[2]);
                    break;
                
                case 'stopwork':
                    this.stopWork(args[0], args[1]);
                    break;
                
                case 'startrest':
                    this.startRest(args[0], args[1]);
                    break;
                
                case 'stoprest':
                    this.stopRest(args[0], args[1]);
                    break;
                
                case 'save':
                    this.saveGame(args[0]);
                    break;
                
                case 'load':
                    this.loadGame(args[0]);
                    break;
                
                case 'savelist':
                    this.showSaveGameList();
                    break;
                
                case 'entities':
                    this.showEntities();
                    break;
                
                case 'buildings':
                    this.showBuildings();
                    break;
                
                case 'monsters':
                    this.showMonsters();
                    break;
                
                case 'status':
                    this.showGameStatus();
                    break;
                
                case 'clear':
                    console.clear();
                    break;
                
                case 'exit':
                case 'quit':
                case 'q':
                    this.rl.close();
                    break;
                
                default:
                    log.info(`❌ 未知命令: ${command}. 输入 'help' 查看帮助`);
            }
        } catch (error) {
            log.info(`❌ 执行命令时出错: ${error}`);
        }
    }

    private showHelp(): void {
        log.info("📖 可用命令:");
        log.info("━".repeat(50));
        log.info("🎯 游戏控制:");
        log.info("  help, h              - 显示帮助");
        log.info("  init                 - 初始化游戏世界");
        log.info("  start                - 开始游戏");
        log.info("  status               - 显示游戏状态");
        log.info("");
        log.info("🔍 数据查询:");
        log.info("  data                 - 显示所有data数据");
        log.info("  query <entityId>     - 查询特定实体的组件数据");
        log.info("  query <entityId> <componentName> - 查询特定组件");
        log.info("  entities             - 显示所有实体");
        log.info("  buildings            - 显示建筑信息");
        log.info("");
        log.info("🏗️ 建筑操作:");
        log.info("  addbuilding <type>   - 添加建筑 (Farm/Factory/...)");
        log.info("  removebuilding <id>  - 移除建筑");
        log.info("");
        log.info("🐺 怪物操作:");
        log.info("  addmonster <type> <name> <level> - 添加怪物");
        log.info("  removemonster <id>   - 移除怪物");
        log.info("  monsters             - 显示怪物信息");
        log.info("");
        log.info("⚒️ 工作操作:");
        log.info("  startwork <monsterId> <buildingId> <workType> - 开始工作");
        log.info("  stopwork <monsterId> <buildingId> - 停止工作");
        log.info("  startrest <monsterId> <buildingId> - 开始休息");
        log.info("  stoprest <monsterId> <buildingId> - 停止休息");
        log.info("");
        log.info("💾 存档操作:");
        log.info("  save [filename]      - 保存游戏");
        log.info("  load <filename>      - 加载游戏");
        log.info("  savelist             - 显示存档列表");
        log.info("");
        log.info("🛠️ 其他:");
        log.info("  clear                - 清屏");
        log.info("  exit, quit, q        - 退出");
        log.info("");
        log.info("💡 示例:");
        log.info("  init");
        log.info("  start");
        log.info("  addbuilding Farm");
        log.info("  addmonster Goblin 小绿 5");
        log.info("  startwork 123 456 Mining");
        log.info("  query 1");
        log.info("  save myGame");
    }

    // todo:读档的话，该怎么识别哪个是avatar
    private initializeGame(): void {
        try {
            log.info("🔄 正在初始化游戏世界...");
            
            const world = GlobalGameManager.getInstance().createWorld();

            this.worldId = world.getId();
            this.isInit = true;

            log.info(`✅ 游戏世界初始化完成`);
            log.info(`📝 Avatar ID: ${this.avatarId}`);
            log.info(`🏠 Space ID: ${this.spaceId}`);
        } catch (error) {
            log.info(`❌ 初始化失败: ${error}`);
        }
    }

    private startGame(): void {
        if (!this.isInit) {
            log.info("❌ 请先执行 'init' 初始化游戏");
            return;
        }

        try {
            log.info("🚀 正在启动游戏...");
            const world = GlobalGameManager.getInstance().getWorld(this.worldId);
            world.start();
            this.avatarId = world.getAvatarId();
            this.spaceId = world.getSpaceId();
            GlobalGameManager.getInstance().startGame();
            this.gameStarted = true;
            log.info("✅ 游戏启动成功！");
        } catch (error) {
            log.info(`❌ 启动游戏失败: ${error}`);
        }
    }

    private showData(): void {
        log.info("📊 当前Data存储状态:");
        log.info("━".repeat(50));
        
        if (data.size === 0) {
            log.info("📭 Data为空");
            return;
        }

        data.forEach((componentMap, entityId) => {
            log.info(`🏷️  实体 ID: ${entityId}`);
            if (componentMap.size === 0) {
                log.info("  📦 无组件数据");
            } else {
                componentMap.forEach((component, componentName) => {
                    log.info(`  📦 组件: ${componentName}`);
                });
            }
            log.info("");
        });
    }

    private queryData(args: string[]): void {
        if (args.length === 0) {
            log.info("❌ 请提供实体ID: query <entityId> [componentName]");
            return;
        }

        const entityId = parseInt(args[0]);
        if (isNaN(entityId)) {
            log.info("❌ 实体ID必须是数字");
            return;
        }

        const componentMap = data.get(entityId);
        if (!componentMap) {
            log.info(`❌ 找不到实体 ID: ${entityId}`);
            return;
        }

        log.info(`🔍 查询实体 ${entityId} 的数据:`);
        log.info("━".repeat(30));

        if (args.length === 1) {
            // 显示所有组件
            if (componentMap.size === 0) {
                log.info("📭 该实体无组件数据");
            } else {
                componentMap.forEach((component, componentName) => {
                    log.info(`📦 组件: ${componentName}`);
                    try {
                        // 尝试显示组件的部分信息（避免过于详细）
                        log.info(`   类型: ${component.constructor.name}`);
                        log.info(`   所有者: ${component.owner?.getId() || 'unknown'}`);
                    } catch (error) {
                        log.info(`   ⚠️  无法显示详细信息: ${error}`);
                    }
                    log.info("");
                });
            }
        } else {
            // 显示特定组件
            const componentName = args[1];
            const component = componentMap.get(componentName);
            if (!component) {
                log.info(`❌ 找不到组件: ${componentName}`);
                return;
            }

            log.info(`📦 组件: ${componentName}`);
            log.info(`   类型: ${component.constructor.name}`);
            log.info(`   所有者: ${component.owner?.getId() || 'unknown'}`);
            
            // 尝试显示更多信息
            try {
                log.info(`   详细信息: ${JSON.stringify(component, null, 2)}`);
            } catch (error) {
                log.info(`   ⚠️  无法序列化组件详细信息`);
            }
        }
    }

    private addBuilding(buildingType?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!buildingType) {
            log.info("❌ 请指定建筑类型: addbuilding <type>");
            log.info("💡 可用类型: Farm, Factory, House, Storage 等");
            return;
        }

        try {
            const type = BuildingType[buildingType as keyof typeof BuildingType];
            if (type === undefined) {
                log.info(`❌ 未知建筑类型: ${buildingType}`);
                log.info("💡 可用类型:", Object.keys(BuildingType).join(', '));
                return;
            }

            log.info(`🏗️  正在添加 ${buildingType} 建筑...`);

            globalMessageService.pushMessage(MessageType.ADD_BUILDING, {
                avatarId: this.avatarId,
                spaceId: this.spaceId,
                buildingType: type
            });

            log.info(`✅ ${buildingType} 建筑添加成功！`);
        } catch (error) {
            log.info(`❌ 添加建筑失败: ${error}`);
        }
    }

    private removeBuilding(buildingIdStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!buildingIdStr) {
            log.info("❌ 请指定建筑ID: removebuilding <id>");
            return;
        }

        const buildingId = parseInt(buildingIdStr);
        if (isNaN(buildingId)) {
            log.info("❌ 建筑ID必须是数字");
            return;
        }

        try {
            log.info(`🗑️  正在移除建筑 ID: ${buildingId}...`);

            globalMessageService.pushMessage(MessageType.REMOVE_BUILDING, {
                avatarId: this.avatarId,
                buildingId: buildingId
            });

            log.info(`✅ 建筑 ${buildingId} 移除成功！`);
        } catch (error) {
            log.info(`❌ 移除建筑失败: ${error}`);
        }
    }

    private addMonster(monsterType?: string, name?: string, levelStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterType || !name || !levelStr) {
            log.info("❌ 请指定完整参数: addmonster <type> <name> <level>");
            log.info("💡 可用类型:", Object.keys(MonsterType).join(', '));
            log.info("💡 示例: addmonster Goblin 小绿 5");
            return;
        }

        const level = parseInt(levelStr);
        if (isNaN(level) || level < 1) {
            log.info("❌ 等级必须是大于0的数字");
            return;
        }

        try {
            const type = MonsterType[monsterType as keyof typeof MonsterType];
            if (type === undefined) {
                log.info(`❌ 未知怪物类型: ${monsterType}`);
                log.info("💡 可用类型:", Object.keys(MonsterType).join(', '));
                return;
            }

            log.info(`🐺 正在添加 ${monsterType} 怪物 "${name}" (等级 ${level})...`);

            globalMessageService.pushMessage(MessageType.ADD_MONSTER, {
                avatarId: this.avatarId,
                spaceId: this.spaceId,
                monsterType: type,
                name: name,
                level: level
            });

            log.info(`✅ ${monsterType} 怪物 "${name}" 添加成功！`);
        } catch (error) {
            log.info(`❌ 添加怪物失败: ${error}`);
        }
    }

    private removeMonster(monsterIdStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterIdStr) {
            log.info("❌ 请指定怪物ID: removemonster <id>");
            return;
        }

        const monsterId = parseInt(monsterIdStr);
        if (isNaN(monsterId)) {
            log.info("❌ 怪物ID必须是数字");
            return;
        }

        try {
            log.info(`🗑️  正在移除怪物 ID: ${monsterId}...`);

            globalMessageService.pushMessage(MessageType.REMOVE_MONSTER, {
                avatarId: this.avatarId,
                monsterId: monsterId
            });

            log.info(`✅ 怪物 ${monsterId} 移除成功！`);
        } catch (error) {
            log.info(`❌ 移除怪物失败: ${error}`);
        }
    }

    private startWork(monsterIdStr?: string, buildingIdStr?: string, workType?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterIdStr || !buildingIdStr || !workType) {
            log.info("❌ 请指定完整参数: startwork <monsterId> <buildingId> <workType>");
            log.info("💡 可用工作类型:", Object.keys(WorkType).join(', '));
            log.info("💡 示例: startwork 123 456 Mining");
            return;
        }

        const monsterId = parseInt(monsterIdStr);
        const buildingId = parseInt(buildingIdStr);
        
        if (isNaN(monsterId) || isNaN(buildingId)) {
            log.info("❌ 怪物ID和建筑ID必须是数字");
            return;
        }

        try {
            const type = WorkType[workType as keyof typeof WorkType];
            if (type === undefined) {
                log.info(`❌ 未知工作类型: ${workType}`);
                log.info("💡 可用类型:", Object.keys(WorkType).join(', '));
                return;
            }

            log.info(`⚒️ 正在安排怪物 ${monsterId} 在建筑 ${buildingId} 开始 ${workType} 工作...`);

            globalMessageService.pushMessage(MessageType.START_WORK, {
                avatarId: this.avatarId,
                buildingId: buildingId,
                workType: type,
                monsterId: monsterId
            });

            log.info(`✅ 怪物 ${monsterId} 开始 ${workType} 工作成功！`);
        } catch (error) {
            log.info(`❌ 开始工作失败: ${error}`);
        }
    }

    private stopWork(monsterIdStr?: string, buildingIdStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterIdStr || !buildingIdStr) {
            log.info("❌ 请指定完整参数: stopwork <monsterId> <buildingId>");
            return;
        }

        const monsterId = parseInt(monsterIdStr);
        const buildingId = parseInt(buildingIdStr);
        
        if (isNaN(monsterId) || isNaN(buildingId)) {
            log.info("❌ 怪物ID和建筑ID必须是数字");
            return;
        }

        try {
            log.info(`⏹️ 正在停止怪物 ${monsterId} 在建筑 ${buildingId} 的工作...`);

            globalMessageService.pushMessage(MessageType.STOP_WORK, {
                avatarId: this.avatarId,
                buildingId: buildingId,
                monsterId: monsterId
            });

            log.info(`✅ 怪物 ${monsterId} 停止工作成功！`);
        } catch (error) {
            log.info(`❌ 停止工作失败: ${error}`);
        }
    }

    private startRest(monsterIdStr?: string, buildingIdStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterIdStr || !buildingIdStr) {
            log.info("❌ 请指定完整参数: startrest <monsterId> <buildingId>");
            return;
        }

        const monsterId = parseInt(monsterIdStr);
        const buildingId = parseInt(buildingIdStr);
        
        if (isNaN(monsterId) || isNaN(buildingId)) {
            log.info("❌ 怪物ID和建筑ID必须是数字");
            return;
        }

        try {
            log.info(`😴 正在安排怪物 ${monsterId} 在建筑 ${buildingId} 开始休息...`);

            globalMessageService.pushMessage(MessageType.START_REST, {
                avatarId: this.avatarId,
                buildingId: buildingId,
                monsterId: monsterId
            });

            log.info(`✅ 怪物 ${monsterId} 开始休息成功！`);
        } catch (error) {
            log.info(`❌ 开始休息失败: ${error}`);
        }
    }

    private stopRest(monsterIdStr?: string, buildingIdStr?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        if (!monsterIdStr || !buildingIdStr) {
            log.info("❌ 请指定完整参数: stoprest <monsterId> <buildingId>");
            return;
        }

        const monsterId = parseInt(monsterIdStr);
        const buildingId = parseInt(buildingIdStr);
        
        if (isNaN(monsterId) || isNaN(buildingId)) {
            log.info("❌ 怪物ID和建筑ID必须是数字");
            return;
        }

        try {
            log.info(`⏰ 正在停止怪物 ${monsterId} 在建筑 ${buildingId} 的休息...`);

            globalMessageService.pushMessage(MessageType.STOP_REST, {
                avatarId: this.avatarId,
                buildingId: buildingId,
                monsterId: monsterId
            });

            log.info(`✅ 怪物 ${monsterId} 停止休息成功！`);
        } catch (error) {
            log.info(`❌ 停止休息失败: ${error}`);
        }
    }

    private saveGame(filename?: string): void {
        if (!this.gameStarted) {
            log.info("❌ 请先初始化并启动游戏");
            return;
        }

        try {
            log.info("💾 正在保存游戏...");
            
            if (filename) {
                globalSaveGameService.saveGame(filename);
                log.info(`✅ 游戏已保存为: ${filename}`);
            } else {
                globalSaveGameService.saveGame();
                log.info("✅ 游戏保存成功！");
            }
        } catch (error) {
            log.info(`❌ 保存游戏失败: ${error}`);
        }
    }

    private loadGame(filename?: string): void {
        if (!filename) {
            log.info("❌ 请指定存档文件名: load <filename>");
            return;
        }

        try {
            log.info(`📁 正在加载游戏: ${filename}...`);
            globalSaveGameService.loadGame(filename);
            this.isInit = true;
            log.info(`✅ 游戏 ${filename} 加载成功！`);
        } catch (error) {
            log.info(`❌ 加载游戏失败: ${error}`);
        }
    }

    private showSaveGameList(): void {
        try {
            log.info("💾 存档列表:");
            log.info("━".repeat(30));
            
            const saveGameList = globalSaveGameService.getSaveGameList();
            if (saveGameList.length === 0) {
                log.info("📭 没有找到存档文件");
                return;
            }

            saveGameList.forEach((saveGame, index) => {
                log.info(`${index + 1}. ${saveGame.filePath}`);
                // 如果有其他属性也可以显示
                if (saveGame.createTime) {
                    log.info(`   时间: ${saveGame.createTime.toISOString()}`);
                }
                if (saveGame.modifyTime) {
                    log.info(`   修改时间: ${saveGame.modifyTime.toISOString()}`);
                }
            });
        } catch (error) {
            log.info(`❌ 获取存档列表失败: ${error}`);
        }
    }

    private showEntities(): void {
        if (!this.worldId) {
            log.info("❌ 请先初始化游戏");
            return;
        }

        log.info("🎭 实体列表:");
        log.info("━".repeat(30));
        log.info(`📝 Avatar: ${this.avatarId}`);
        log.info(`🏠 Space: ${this.spaceId}`);
    }

    private showBuildings(): void {
        if (!this.avatarId || !this.spaceId) {
            log.info("❌ 请先初始化游戏");
            return;
        }

        try {
            log.info("🏗️  建筑信息:");
            log.info("━".repeat(30));
            
            // 尝试获取建筑列表组件
            const buildingListComponent = data.get(this.spaceId)?.get("BuildingList") as BuildingListComponent;
            if (buildingListComponent) {
                const buildings = buildingListComponent.getBuildingList();
                if (buildings.length === 0) {
                    log.info("🏗️  当前没有建筑");
                } else {
                    buildings.forEach((buildingId: number, index: number) => {
                        log.info(`${index + 1}. 建筑 ID: ${buildingId}`);
                    });
                }
            } else {
                log.info("❌ 无法获取建筑列表组件");
            }
        } catch (error) {
            log.info(`❌ 获取建筑信息失败: ${error}`);
        }
    }

    private showMonsters(): void {
        if (!this.avatarId || !this.spaceId) {
            log.info("❌ 请先初始化游戏");
            return;
        }

        try {
            log.info("🐺 怪物信息:");
            log.info("━".repeat(30));
            
            // 尝试获取怪物列表组件
            const monsterListComponent = data.get(this.avatarId)?.get("MonsterList") as MonsterListComponent;
            if (monsterListComponent) {
                const monsters = monsterListComponent.getMonsterList();
                if (monsters.length === 0) {
                    log.info("🐺 当前没有怪物");
                } else {
                    monsters.forEach((monsterIdStr: string, index: number) => {
                        const monsterId = parseInt(monsterIdStr);
                        const monsterComponents = data.get(monsterId);
                        if (monsterComponents) {
                            const monsterProperty = monsterComponents.get("MonsterProperty");
                            if (monsterProperty) {
                                const mp = monsterProperty as any;
                                log.info(`${index + 1}. 怪物 ID: ${monsterId}`);
                                log.info(`   类型: ${mp.baseProperty?.type || '未知'}`);
                                log.info(`   名称: ${mp.baseProperty?.name || '未命名'}`);
                                log.info(`   等级: ${mp.baseProperty?.level || 1}`);
                                log.info(`   状态: ${mp.status || '未知'}`);
                            } else {
                                log.info(`${index + 1}. 怪物 ID: ${monsterId} (无属性信息)`);
                            }
                        } else {
                            log.info(`${index + 1}. 怪物 ID: ${monsterId} (数据未找到)`);
                        }
                    });
                }
            } else {
                log.info("❌ 无法获取怪物列表组件");
            }
        } catch (error) {
            log.info(`❌ 获取怪物信息失败: ${error}`);
        }
    }

    private showGameStatus(): void {
        log.info("🎮 游戏状态:");
        log.info("━".repeat(30));
        log.info(`🌍 世界已创建: ${this.worldId ? '✅' : '❌'}`);
        log.info(`📝 Avatar已创建: ${this.avatarId ? '✅' : '❌'}`);
        log.info(`🏠 Space已创建: ${this.spaceId ? '✅' : '❌'}`);
        log.info(`🚀 游戏已启动: ${this.gameStarted ? '✅' : '❌'}`);
        log.info(`📊 Data条目数: ${data.size}`);
    }
}

// 启动控制台
function main() {
    const console_app = new InteractiveGameConsole();
    console_app.start();
}

// 导出以便外部调用
export { InteractiveGameConsole, TestPropertySyncService, data };

// 如果直接运行此文件，则启动控制台
if (require.main === module) {
    main();
}

