# 帕鲁工作系统 (Pal Work System)

一个完整的帕鲁工作管理系统，让玩家的怪物伙伴可以进行各种工作来产出道具和资源。

## 📋 功能特性

### 🐾 怪物工作能力
- **多种怪物类型**：哥布林、兽人、巨魔、龙族、恶魔、亡灵
- **专业化工作**：每种怪物擅长不同的工作类型
- **效率系统**：基于怪物类型和工作类型的效率计算
- **经验成长**：工作经验积累系统

### 🔧 工作类型
1. **挖矿 (Mining)** - 获得石材、铁矿石、魔法水晶
2. **伐木 (Logging)** - 获得木材、浆果
3. **农耕 (Farming)** - 获得浆果、治疗草药、布料
4. **建造 (Construction)** - 获得工具、石材
5. **制作 (Crafting)** - 获得装备、布料
6. **烹饪 (Cooking)** - 获得食物、药剂
7. **运输 (Transport)** - 获得各种基础资源
8. **守卫 (Guarding)** - 获得皮革、肉类、矿石
9. **研究 (Research)** - 获得水晶、符文、药剂
10. **狩猎 (Hunting)** - 获得肉类、皮革、龙鳞

### 📦 道具系统
- **基础资源**：石材、木材、食物、金属、水晶、草药
- **制作材料**：布料、皮革、药剂
- **高级道具**：武器、防具、工具
- **稀有道具**：龙鳞、古代符文等传说级材料

## 🚀 快速开始

### 基本使用

```typescript
import { WorkManager } from './Logic/WorkManager';
import { createExampleMonster } from './Logic/WorkSystemExample';
import { MonsterType } from './Data/common';
import { WorkType } from './Data/WorkData';

// 创建工作管理器
const workManager = new WorkManager();

// 创建一个哥布林
const goblin = createExampleMonster(MonsterType.Goblin, "矿工哥布林", 2);

// 让哥布林开始挖矿
const result = workManager.startWork(goblin, WorkType.Mining);
log.info(result.message);

// 更新工作进度（通常在游戏循环中调用）
const completedWorks = workManager.updateWorkProgress();
for (const work of completedWorks) {
    log.info(work.message);
}
```

### 运行演示

```typescript
import { runWorkSystemDemo } from './Logic/WorkSystemExample';

// 运行完整的演示程序
runWorkSystemDemo();
```

## 📊 怪物工作能力表

| 怪物类型 | 擅长工作 | 效率 | 特点 |
|---------|---------|------|------|
| 哥布林 (Goblin) | 挖矿、运输、制作 | 60-80% | 平衡型工人 |
| 兽人 (Orc) | 建造、伐木、守卫、狩猎 | 70-90% | 力量型工人 |
| 巨魔 (Troll) | 挖矿、建造、运输 | 85-95% | 重型工作专家 |
| 龙族 (Dragon) | 研究、守卫、狩猎、制作 | 85-100% | 万能型精英 |
| 恶魔 (Demon) | 研究、制作、烹饪、守卫 | 80-95% | 技术型专家 |
| 亡灵 (Undead) | 农耕、烹饪、研究、守卫 | 75-90% | 持久型工人 |

## 🎮 核心系统

### 工作分配
```typescript
// 检查怪物是否能工作
const canWork = workManager.canWork(monster, WorkType.Mining);
if (canWork.canWork) {
    workManager.startWork(monster, WorkType.Mining);
} else {
    log.info(canWork.reason);
}
```

### 进度监控
```typescript
// 获取所有活跃工作
const activeWorks = workManager.getActiveWorks();

// 获取特定怪物的工作进度
const progress = workManager.getMonsterWorkProgress("矿工哥布林");
if (progress) {
    log.info(`进度: ${Math.round(progress.progress * 100)}%`);
}
```

### 库存管理
```typescript
// 获取库存
const inventory = workManager.getInventory();

// 获取特定道具数量
const stoneCount = workManager.getItemCount("stone");
```

### 体力管理
```typescript
// 恢复怪物体力
workManager.restoreStamina(monster, 50);
```

## ⚙️ 高级功能

### 自定义怪物
```typescript
import { MonsterData } from './Data/MonsterData';
import { WorkAbility } from './Data/WorkData';

const customMonster: MonsterData = {
    name: "自定义怪物",
    type: MonsterType.Dragon,
    level: 10,
    // ... 其他属性
    workAbilities: [
        { workType: WorkType.Research, efficiency: 100, stamina: 30 }
    ],
    stamina: 200,
    maxStamina: 200,
    workExperience: new Map(),
    isWorking: false
};
```

### 工作配置自定义
您可以修改 `WorkConfigs.ts` 中的配置来调整：
- 工作时间
- 产出物品和概率
- 等级要求
- 体力消耗

### 道具数据扩展
在 `GameItems.ts` 中添加新的道具：
```typescript
["new_item", {
    id: "new_item",
    name: "新道具",
    type: ItemType.Rare,
    rarity: 4,
    value: 100,
    description: "一个新的稀有道具"
}]
```

## 🔄 工作流程

1. **创建怪物** - 使用 `createExampleMonster` 或自定义创建
2. **分配工作** - 调用 `workManager.startWork()`
3. **监控进度** - 定期调用 `workManager.updateWorkProgress()`
4. **收获奖励** - 自动添加到库存
5. **管理体力** - 使用 `restoreStamina()` 恢复体力

## 📈 效率计算

工作时间 = 基础时间 × (100 / 怪物效率)
产出数量 = 基础数量 × (怪物效率 / 100)
经验获得 = 基础经验 × (怪物效率 / 100)

## 🔧 扩展建议

1. **UI界面** - 添加图形界面显示工作进度
2. **自动化** - 实现工作队列和自动分配
3. **升级系统** - 基于工作经验提升怪物能力
4. **建筑系统** - 添加工作站提升效率
5. **任务系统** - 基于工作产出的任务奖励

## 📝 注意事项

- 怪物需要足够的体力才能工作
- 不同工作有等级要求
- 效率影响工作时间和产出
- 工作经验会累积，为未来升级系统做准备

这个工作系统为帕鲁游戏提供了完整的工作管理功能，玩家可以合理分配怪物进行不同工作，获得各种道具和资源。 