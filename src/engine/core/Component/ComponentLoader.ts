// 组件加载器 - 确保所有组件的装饰器被执行，从而完成注册
// 这些导入会触发@RegisterComponent装饰器的执行

// 基础组件
import "./Basic/BackpackComponent";
import "./Basic/SpaceComponent";
import "./Basic/OwnerComponent";
import "./Basic/PositionComponent";
import "./Basic/MovementComponent";

// 列表组件
import "./List/MonsterListComponent";
import "./List/BuildingListComponent";
import "./List/RewardListComponent"

// 输入组件
import "./Input/MessageComponent";

// 属性组件
import "./Property/MonsterPropertyComponent";
import "./Property/BuildingPropertyComponent";
import "./Property/AvatarPropertyComponent";
import "./Property/RoomPropertyComponent";
import "./Property/HallPropertyComponent";

// 工作进度组件
import "./Work/BuildingWorkProgressComponent";
import "./Work/ProductionWorkProgressComponent";
import "./Work/RestWorkProgressComponent";
import "./Work/SyntheticWorkProgressComponent";

// 地图组件
import "./Map/HexMapComponent";
import "./Map/HexMapNavitationComponent";



