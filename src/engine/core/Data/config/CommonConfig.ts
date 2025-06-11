// 通用配置数据
const commonConfigData = {
    "frame": 20,
    "replayFrame": 5
};

export interface CommonConfig {
    frame: number;
    replayFrame: number;
}

export const CommonConfig: CommonConfig = {
    frame: commonConfigData.frame,
    replayFrame: commonConfigData.replayFrame
}
