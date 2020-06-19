import React, { ReactElement, Children, cloneElement } from 'react';
import { Tooltip } from 'antd';
import styles from './index.less';

const Sticker = ({
    children,
    style = {},
    title,
}: {
    children: ReactElement,
    style?: object,
    title?: string,
}) => {
    const cloneTarget = cloneElement(Children.only(children), {
        className: `${styles.sticker} ${children.props.className}`,
        style: {
            ...children.props.style,
            ...style,
        },
    });
    let output = cloneTarget
    if (title) {
        output = (
            <Tooltip title={title}>
                {cloneTarget}
            </Tooltip>
        )
    }
    return output;
};

export default Sticker;