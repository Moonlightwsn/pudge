export const eventsType = {
    start: ['mousedown'],
    end: ['mouseup'],
    move: ['mousemove'],
};

export const addEvent = (el: Node, event: string, handler: EventListener, extraOptions?: object) => {
    if (!el) return;
    const options = { capture: true, ...extraOptions };
    if (el.addEventListener) {
        el.addEventListener(event, handler, options);
    }
};

export const removeEvent = (el: Node, event: string, handler: EventListener, extraOptions?: object) => {
    if (!el) return;
    const options = { capture: true, ...extraOptions };
    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    }
};

/**
 * 计算相同标尺下target点在以zero点为坐标原点的坐标系中位于第几象限
 * @param zero 
 * @param target 
 */
export const whichQuadrant = (zero: { x: number, y: number }, target: { x: number, y: number }) => {
    const { x: targetX, y: targetY } =  target;
    const { x: zeroX, y: zeroY } = zero;
    return {
        x: targetX - zeroX,
        y: targetY - zeroY,
    };
};

/**
 * 判断两个向量是否同一方向
 * @param v1 
 * @param v2 
 * 
 * 返回结果 1: 方向相同  -1: 方向相反  0: 其他
 */
export const compareVec = (v1: { x: number, y: number }, v2: { x: number, y: number }) => {
    // 第一象限
    if (v1.x > 0 && v2.x > 0 && v1.y < 0 && v2.y < 0) {
        return 1;
    }
    if (v1.x > 0 && v2.x < 0 && v1.y < 0 && v2.y > 0) {
        return -1;
    }
    // 第二象限
    if (v1.x < 0 && v2.x < 0 && v1.y < 0 && v2.y < 0) {
        return 1;
    }
    if (v1.x < 0 && v2.x > 0 && v1.y < 0 && v2.y > 0) {
        return -1;
    }
    // 第三象限
    if (v1.x < 0 && v2.x < 0 && v1.y > 0 && v2.y > 0) {
        return 1;
    }
    if (v1.x < 0 && v2.x > 0 && v1.y > 0 && v2.y < 0) {
        return -1;
    }
    // 第四象限
    if (v1.x > 0 && v2.x > 0 && v1.y > 0 && v2.y > 0) {
        return 1;
    }
    if (v1.x > 0 && v2.x < 0 && v1.y > 0 && v2.y < 0) {
        return -1;
    }

    return 0;
};