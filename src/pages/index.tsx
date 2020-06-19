import React from 'react';
import { history } from 'umi';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './index.less';

export default () => {
    return (
        <div
            className={styles.home}
            style={{
                backgroundColor: '#bae7ff',
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    padding: '60px 0 0',
                    margin: 'auto',
                    textAlign: 'center',
                }}
            >
                <img src={require('@/assets/pudge.jpg')} width="240" height="150" style={{ borderRadius: 12, cursor: 'pointer' }} />
                <p style={{ fontSize: 28, marginTop: 40, marginBottom: 28 }}>欢迎使用Pudge</p>
                <p style={{ fontSize: 16, marginBottom: 16 }}>点击下方按钮进入工作台</p>
                <Button
                    shape="circle"
                    type="primary"
                    icon={<ArrowRightOutlined style={{ fontSize: 26 }} />}
                    style={{
                        width: 52,
                        height: 52,
                        fontSize: 26,
                        marginTop: 12
                    }}
                    size="large"
                    onClick={e => {
                        e.preventDefault();
                        history.push('/workbench')
                    }}
                />
            </div>
        </div>
    );
}
