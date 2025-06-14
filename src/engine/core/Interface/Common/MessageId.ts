import { Position } from "../../Data/common";

/**
 * 消息类型枚举
 */
export enum MessageType {
    ENTER_ROOM = 1,

    ADD_BUILDING = 1001,
    REMOVE_BUILDING = 1002,

    ADD_MONSTER = 1501,
    REMOVE_MONSTER = 1502,

    START_WORK = 2001,
    STOP_WORK = 2002,
    START_REST = 2003,
    STOP_REST = 2004,
}

/**
 * 消息参数接口定义
 */
export interface MessageParams {
    [MessageType.ENTER_ROOM]: {
        leaveEntityId: number;
    };
    [MessageType.ADD_BUILDING]: {
        avatarId: number;
        spaceId: number;
        buildingType: string;
        x: number;
        y: number;
    };
    [MessageType.REMOVE_BUILDING]: {
        avatarId: number;
        buildingId: number;
    };
    [MessageType.ADD_MONSTER]: {
        avatarId: number;
        spaceId: number;
        monsterType: string;
        name: string;
        level: number;
        x: number;
        y: number;
    };
    [MessageType.REMOVE_MONSTER]: {
        avatarId: number;
        monsterId: number;
    };
    [MessageType.START_WORK]: {
        avatarId: number;
        buildingId: number;
        workType: string;
        monsterId: number;
        position: Position;
    };
    [MessageType.STOP_WORK]: {
        avatarId: number;
        buildingId: number;
        monsterId: number;
    };
    [MessageType.START_REST]: {
        avatarId: number;
        buildingId: number;
        monsterId: number;
    };
    [MessageType.STOP_REST]: {
        avatarId: number;
        buildingId: number;
        monsterId: number;
    };
}