import * as fs from 'fs';
import * as path from 'path';
import { log } from './LogService';
import { GlobalGameManager } from '../../Infra/GlobalGameManager';

// 存档文件信息接口
export interface SaveGameInfo {
    fileName: string;        // 文件名
    filePath: string;        // 完整文件路径
    fileSize: number;        // 文件大小（字节）
    createTime: Date;        // 创建时间
    modifyTime: Date;        // 修改时间
}

export abstract class SaveGameService {
    public constructor() {
    }

    public saveGame(filePath: string = "") {
        const bytes = this.saveGameInner();
        this.saveGameOuter(bytes, filePath);
    }

    private saveGameInner(): ArrayBuffer {
        const bytes = GlobalGameManager.getInstance().saveGame();
        return bytes;
    }

    protected saveGameOuter(bytes: ArrayBuffer, filePath: string) {
        try {
            let targetFilePath: string;
            
            if (filePath === "" || filePath == null) {
                // 如果filePath为空，则在save目录下新建带时间戳的存档
                const saveDir = path.join(process.cwd(), 'save');
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `savegame_${timestamp}.json`;
                targetFilePath = path.join(saveDir, fileName);
            } else {
                // 如果filePath存在，则直接覆盖该路径的存档文件
                const saveDir = path.dirname(filePath);
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                targetFilePath = filePath;
            }
    
            // 将ArrayBuffer转换为Buffer并写入文件
            const buffer = Buffer.from(bytes);
            fs.writeFileSync(targetFilePath, buffer);
    
            if (filePath === "" || filePath == null) {
                log.info(`游戏存档已保存至: ${targetFilePath}`);
            } else {
                log.info(`游戏存档已覆盖保存至: ${targetFilePath}`);
            }
        } catch (error) {
            console.error('保存游戏存档时发生错误:', error);
            throw error;
        }
    }
    
    /**
     * 获取save目录下所有存档文件列表
     * @returns 存档文件信息数组，按修改时间降序排序（最新的在前）
     */
    public getSaveGameList(): SaveGameInfo[] {
        try {
            const saveDir = path.join(process.cwd(), 'save');
            
            // 如果save目录不存在，返回空数组
            if (!fs.existsSync(saveDir)) {
                log.info('save目录不存在，返回空的存档列表');
                return [];
            }
    
            // 读取目录下的所有文件
            const files = fs.readdirSync(saveDir);
            const saveGameInfos: SaveGameInfo[] = [];
    
            for (const fileName of files) {
                const filePath = path.join(saveDir, fileName);
                const stats = fs.statSync(filePath);
    
                // 只处理文件，跳过目录
                if (stats.isFile()) {
                    saveGameInfos.push({
                        fileName: fileName,
                        filePath: filePath,
                        fileSize: stats.size,
                        createTime: stats.birthtime,
                        modifyTime: stats.mtime
                    });
                }
            }
    
            // 按修改时间降序排序（最新的在前）
            saveGameInfos.sort((a, b) => b.modifyTime.getTime() - a.modifyTime.getTime());
    
            log.info(`找到 ${saveGameInfos.length} 个存档文件`);
            return saveGameInfos;
        } catch (error) {
            console.error('获取存档列表时发生错误:', error);
            throw error;
        }
    }

    public loadGame(filePath: string): boolean {
        const bytes = this.loadGameOuter(filePath);
        return this.loadGameInner(bytes);
    }

    private loadGameInner(bytes: ArrayBuffer): boolean {
        return GlobalGameManager.getInstance().loadGame(bytes);
    }
    
    /**
     * 加载指定的存档文件
     * @param filePath 存档文件的完整路径
     * @returns 存档数据的ArrayBuffer
     */
    protected loadGameOuter(filePath: string): ArrayBuffer {
        try {
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`存档文件不存在: ${filePath}`);
            }
    
            // 读取文件内容
            const buffer = fs.readFileSync(filePath);
            
            // 将Node.js Buffer转换为ArrayBuffer
            const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
            log.info(`成功加载存档文件: ${path.basename(filePath)}, 大小: ${buffer.length} 字节`);
            return arrayBuffer;
        } catch (error) {
            console.error('加载存档文件时发生错误:', error);
            throw error;
        }
    }
    
    /**
     * 删除指定的存档文件
     * @param filePath 存档文件的完整路径
     */
    public deleteGame(filePath: string): void {
        try {
            if (!fs.existsSync(filePath)) {
                console.warn(`存档文件不存在，无法删除: ${filePath}`);
                return;
            }
    
            fs.unlinkSync(filePath);
            log.info(`成功删除存档文件: ${path.basename(filePath)}`);
        } catch (error) {
            console.error('删除存档文件时发生错误:', error);
            throw error;
        }
    }
}

export class DefaultSaveGameService extends SaveGameService {
}

export let globalSaveGameService: SaveGameService = new DefaultSaveGameService();
export function setGlobalSaveGameService(newSaveGameService: SaveGameService) {
    globalSaveGameService = newSaveGameService;
}