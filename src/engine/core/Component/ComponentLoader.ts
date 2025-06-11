// 组件加载器 - 确保所有组件的装饰器被执行，从而完成注册
// 这些导入会触发@RegisterComponent装饰器的执行

// 基础组件
import "./BackpackComponent";
import "./SpaceComponent";
import "./TimeComponent";
import "./RewardListComponent";
import "./OwnerComponent";
import "./PositionComponent";

// 列表组件
import "./List/MonsterListComponent";
import "./List/BuildingListComponent";

// 输入组件
import "./Input/MessageComponent";

// 属性组件
import "./Property/MonsterPropertyComponent";
import "./Property/BuildingPropertyComponent";
import "./Property/AvatarPropertyComponent";
import "./Property/RoomPropertyComponent";
import "./Property/HallPropertyComponent";

// 进度组件
import "./WorkProgressComponent";
import "./RestProgressComponent";

// 处理组件
import "./Process/ProcessBuildingComponent";

// 工作进度组件
import "./Work/BuildingWorkProgressComponent";
import "./Work/ProductionWorkProgressComponent";
import "./Work/RestWorkProgressComponent";
import "./Work/SyntheticWorkProgressComponent";

