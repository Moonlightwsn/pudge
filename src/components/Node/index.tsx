import React, { RefObject, useRef, useState } from 'react';
import useTransform from '../../react-use/useTransform';

const Node = ({
    parentRef,
    src,
    style,
}: {
    parentRef: RefObject<HTMLElement>
    src: string,
    style: object,
}) => {
    const currentRef = useRef(null);
    const nailRef = useRef(null);
    const [state, setState] = useState({
        cursor: 'grab',
    });
    const [transform] = useTransform({
        current: currentRef,
        parent: parentRef,
        nail: nailRef,
        bound: true,
    });
    const translateStyles = `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}, ${transform.scale})`;
    return (
        <span
            style={{
                position: 'relative',
                display: 'inline-block',
                transform: translateStyles,
                ...style,
            }}
        >
            <img
                ref={currentRef}
                style={{
                    cursor: state.cursor,
                }}
                src={src}
                alt="imgNode"
                onMouseDown={e => {
                    e.preventDefault();
                    setState(prevState => {
                        return {
                            ...prevState,
                            cursor: 'grabbing',
                        };
                    });
                }}
                onMouseUp={e => {
                    e.preventDefault();
                    setState(prevState => {
                        return {
                            ...prevState,
                            cursor: 'grab',
                        };
                    });
                }}
            />
            <span
                ref={nailRef}
                style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    width: 12,
                    height: 12,
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    border: '1px solid #1890ff',
                    cursor: 'nwse-resize',
                    transform: `scale(${1 / transform.scale})`,
                }}
            />
        </span>
    )
};

export default Node;