import React, { ReactElement, Children, cloneElement } from 'react';
import { Tooltip } from 'antd';
import styles from './index.less';

const Sticker = ({
  children,
  style = {},
  title,
  placement,
}: {
  children: ReactElement;
  style?: object;
  title?: string;
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
}) => {
  const cloneTarget = cloneElement(Children.only(children), {
    className: `${styles.sticker} ${children.props.className}`,
    style: {
      ...children.props.style,
      ...style,
    },
  });
  let output = cloneTarget;
  if (title) {
    output = (
      <Tooltip title={title} placement={placement}>
        {cloneTarget}
      </Tooltip>
    );
  }
  return output;
};

export default Sticker;
