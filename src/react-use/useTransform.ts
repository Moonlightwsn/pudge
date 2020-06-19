import { useReducer, useEffect, RefObject, Dispatch } from 'react';
import { addEvent, removeEvent, eventsType, whichQuadrant, compareVec } from './utils/utils';

interface transformProps {
    current: RefObject<HTMLElement>,
    parent?: RefObject<HTMLElement>,
    nail?: RefObject<HTMLElement>,
    bound?: boolean,
}

interface Transform {
    translateX: number,
    translateY: number,
    centerX: number,
    centerY: number,
    standardWidth: number,
    standardHeight: number,
    standardRadius: number,
    lastRadius: number,
    lastX: number,
    lastY: number,
    scale: number,
}

interface Management {
    dragging: boolean,
    builtinResizing: boolean,
    resizing: boolean,
}

interface State {
    managementData: Management,
    transform: Transform,
}

interface Action {
    type: string,
    payload?: any,
}

type eventType = 'start' | 'end' | 'move';

type moveType = 'dragging' | 'resizing' | 'builtinResizing';

const moveTrigger: moveType[] = [
    'dragging',
    'resizing',
    'builtinResizing',
];

const addEvents = (el: Node, type: eventType, handler: EventListener, options?: object) => {
    const events = eventsType[type];
    events.forEach(e => {
        addEvent(el, e, handler, options);
    });
};

const removeEvents = (el: Node, type: eventType, handler: EventListener, options?: object) => {
    const events = eventsType[type];
    events.forEach(e => {
        removeEvent(el, e, handler, options);
    });
};

// 判断缩放的方向
const Zoom = (v1: { x: number, y: number }, v2: { x: number, y: number }) => {
    const compareRes = compareVec(v1, v2);
    if (compareRes > 0) {
        return 'zoomin';
    }
    if (compareRes < 0) {
        return 'zoomout';
    }
    return;
};

const reducer = (prevState: State, action: Action): State => {
    const { payload, type } = action;
    switch (type) {
        case 'init':
            return {
                ...prevState,
                transform: {
                    ...prevState.transform,
                    ...payload,
                },
            };
        case 'start':
            const { x: lastX, y: lastY, startType } = payload;
            const newManagementData: { dragging?: boolean, builtinResizing?: boolean, resizing?: boolean } = {};
            if (startType === 'resize') {
                newManagementData.resizing = true;
                newManagementData.dragging = false;
                newManagementData.builtinResizing = false;
            } else if (startType === 'drag') {
                newManagementData.dragging = true;
            } else if (startType === 'builtinResize') {
                newManagementData.builtinResizing = true;
            }
            return {
                ...prevState,
                managementData: {
                    ...prevState.managementData,
                    ...newManagementData,
                },
                transform: {
                    ...prevState.transform,
                    lastX,
                    lastY,
                },
            };
        case 'end':
            return {
                ...prevState,
                managementData: {
                    ...prevState.managementData,
                    dragging: false,
                    builtinResizing: false,
                    resizing: false,
                },
                transform: {
                    ...prevState.transform,
                    ...payload,
                },
            };
        case 'move':
            const { bound, x, y, parentLeft, parentTop, parentRight, parentBottom, currentLeft, currentTop, currentRight, currentBottom } = payload;
            if (moveTrigger.some(mt => prevState.managementData[mt])) {
                let { lastX, lastY, translateX, translateY, lastRadius, standardRadius, scale } = prevState.transform;
                if (Number.isNaN(lastX) || Number.isNaN(lastY)) {
                    lastX = translateX;
                    lastY = translateY;
                }
                let deltaX = x - lastX;
                let deltaY = y - lastY;
                let newTranslateX = translateX;
                let newTranslateY = translateY;
                if (prevState.managementData.resizing) {
                    // 元素右下角拉拽操作来缩放Node
                    const { centerX, centerY, standardRadius } = prevState.transform;
                    if (x > centerX && y > centerY) {
                        scale = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / standardRadius;
                    }
                } else if (prevState.managementData.dragging) {
                    // 拖动元素的位置
                    if (bound) {
                        // 当前元素的位置不能超过参考父元素的边界
                        const leftDistance = parentLeft - currentLeft;
                        const rightDistance = parentRight - currentRight;
                        const topDistance = parentTop - currentTop;
                        const bottomDistance = parentBottom - currentBottom;
                        if (deltaX < leftDistance) {
                            deltaX = leftDistance;
                        } else if (deltaX > rightDistance) {
                            deltaX = rightDistance
                        }
            
                        if (deltaY < topDistance) {
                            deltaY = topDistance;
                        } else if (deltaY > bottomDistance) {
                            deltaY = bottomDistance; 
                        }
    
                        if ((currentTop < parentTop && deltaY < 0) || (currentBottom > parentBottom && deltaY > 0)) {
                            deltaY = 0;
                        }
                    }
                    newTranslateX += deltaX;
                    newTranslateY += deltaY; 
                } else if (prevState.managementData.builtinResizing) {
                    // 元素内任意位置进行右键拖拽操作来缩放元素，根据当前鼠标在元素内的第几象限与鼠标拖动的方向来判断是放大还是缩小
                    const vector1 = whichQuadrant({ x: prevState.transform.centerX, y: prevState.transform.centerY }, { x, y });
                    const vector2 = { x: deltaX, y: deltaY };
                    const action = Zoom(vector1, vector2);
                    if (action === 'zoomin') {
                        const deltaRadius = Math.round(Math.sqrt(Math.pow(Math.round(deltaX), 2) + Math.pow(Math.round(deltaY), 2)));
                        lastRadius += deltaRadius;
                    } else if (action === 'zoomout') {
                        const deltaRadius = Math.round(Math.sqrt(Math.pow(Math.round(deltaX), 2) + Math.pow(Math.round(deltaY), 2)));
                        lastRadius -= deltaRadius;
                    }
                    scale = lastRadius / standardRadius;
                }
                return {
                    ...prevState,
                    transform: {
                        ...prevState.transform,
                        translateX: newTranslateX,
                        translateY: newTranslateY,
                        lastRadius,
                        lastX: x,
                        lastY: y,
                        scale,
                    },
                };
            }
            return prevState;
        default:
            throw new Error('illegal operation');
    }
};

const initialState: State = {
    managementData: {
        dragging: false,
        builtinResizing: false,
        resizing: false,
    },
    transform: {
        translateX: 0,
        translateY: 0,
        centerX: 0,
        centerY: 0,
        standardWidth: 0,
        standardHeight: 0,
        standardRadius: 0,
        lastRadius: 0,
        lastX: NaN,
        lastY: NaN,
        scale: 1,
    },
};

const useTransform = ({
    current,
    parent,
    nail,
    bound,
}: transformProps): [Transform, Dispatch<Action>] => {
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => {
        let currentElement: HTMLElement;
        let offsetParent: Element | null;
        let ownerDocument: Document;

        const handleDrag = (e: MouseEvent | Event) => {
            e.preventDefault();
            if (currentElement && offsetParent) {
                if (e instanceof MouseEvent) {
                    const { clientX = 0, clientY = 0 } = e;
                    const { scrollLeft = 0, scrollTop = 0 } = offsetParent;
                    const { left: parentLeft = 0, top: parentTop = 0, right: parentRight = 0, bottom: parentBottom = 0 } = offsetParent.getBoundingClientRect();
                    let x = clientX + scrollLeft - parentLeft;
                    let y = clientY + scrollTop - parentTop;
                    const { left: currentLeft = 0, top: currentTop = 0, right: currentRight = 0, bottom: currentBottom = 0 } = currentElement.getBoundingClientRect();
                    dispatch({
                        type: 'move',
                        payload: {
                            x,
                            y,
                            parentLeft,
                            parentTop,
                            parentRight,
                            parentBottom,
                            currentLeft,
                            currentTop,
                            currentRight,
                            currentBottom,
                            bound,
                        },
                    });
                }
            }
        };

        const handleDragEnd = (e: Event) => {
            e.preventDefault();
            removeEvents(ownerDocument, 'move', handleDrag);
            removeEvents(ownerDocument, 'end', handleDragEnd);
            if (currentElement && offsetParent) {
                const { left: parentLeft = 0, top: parentTop = 0 } = offsetParent.getBoundingClientRect();
                const { left: currentLeft = 0, top: currentTop = 0, width: currentWidth = 0, height: currentHeight = 0 } = currentElement.getBoundingClientRect();
                // 在父元素坐标系下当前元素的中心坐标点centerX, centerY
                const centerX = Math.round(currentLeft - parentLeft + (currentWidth / 2));
                const centerY = Math.round(currentTop - parentTop + (currentHeight / 2));
                dispatch({ type: 'end', payload: {
                    centerX,
                    centerY,
                    lastX: NaN,
                    lastY: NaN,
                } });
            }
        };

        const handleDragStart = (e: MouseEvent | Event, target?: string) => {
            e.preventDefault();
            if (currentElement && offsetParent) {
                if (e instanceof MouseEvent) {
                    let startType;
                    let x = NaN;
                    let y = NaN;
                    if (target && target === 'nail') {
                        startType = 'resize';
                    } else {
                        const { clientX = 0, clientY = 0, buttons } = e;
                        const { scrollLeft = 0, scrollTop = 0 } = offsetParent;
                        const { left = 0, top = 0 } = offsetParent.getBoundingClientRect();
                        x = clientX + scrollLeft - left;
                        y = clientY + scrollTop - top;

                        if (buttons === 1) {
                            startType = 'drag';
                        } else if (buttons === 2) {
                            startType = 'builtinResize';
                        }
                    }
                    dispatch({ type: 'start', payload: {
                        x,
                        y,
                        startType,
                    } });
                }
                addEvents(ownerDocument, 'move', handleDrag);
                addEvents(ownerDocument, 'end', handleDragEnd);
            }
        };

        const handleResizeStart = (e: Event) => {
            handleDragStart(e, 'nail');
        };

        if (current && current.current) {
            currentElement = current.current;
            ownerDocument = currentElement.ownerDocument;
            // 确定当前元素的参考父元素，如果没有合适的父元素则以body为准
            offsetParent = (parent && parent.current) ? parent.current : currentElement.offsetParent;
            offsetParent = offsetParent ? offsetParent : ownerDocument.body;

            if (offsetParent) {
                const { left: parentLeft = 0, top: parentTop = 0 } = offsetParent.getBoundingClientRect();
                const { left: currentLeft = 0, top: currentTop = 0, width: currentWidth = 0, height: currentHeight = 0 } = currentElement.getBoundingClientRect();
                // 在父元素坐标系下当前元素的中心坐标点centerX, centerY
                const centerX = Math.round(currentLeft - parentLeft + (currentWidth / 2));
                const centerY = Math.round(currentTop - parentTop + (currentHeight / 2));
                // 当前元素进行缩放操作时的基准尺寸standardWidth, standardHeight
                const standardWidth = Math.round(currentWidth);
                const standardHeight = Math.round(currentHeight);

                // standardWidth standardHeight计算中心点与顶点的距离
                const standardRadius = Math.round(Math.sqrt(Math.pow(Math.round(standardWidth / 2), 2) + Math.pow(Math.round(standardHeight / 2), 2)));
    
                // 为当前元素绑定DragStart事件 (onMouseDown onTouchStart)
                addEvents(currentElement, 'start', handleDragStart);
                addEvent(currentElement, 'contextmenu', e => {
                    e.preventDefault();
                });
                if (nail && nail.current) {
                    addEvents(nail.current, 'start', handleResizeStart);
                }
    
                dispatch({
                    type: 'init',
                    payload: {
                        centerX,
                        centerY,
                        standardWidth,
                        standardHeight,
                        standardRadius,
                        lastRadius: standardRadius,
                    },
                });
            }
        }
        return () => {
            removeEvents(ownerDocument, 'move', handleDrag);
            removeEvents(ownerDocument, 'end', handleDragEnd);
            removeEvents(currentElement, 'start', handleDragStart);
        };
    }, [current, parent, bound]);
    return [state.transform, dispatch];
};

export default useTransform;