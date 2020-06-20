import React, { useState, useEffect, useRef, RefObject } from 'react';
import { history } from 'umi';
import { Button, notification } from 'antd';
import { ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';
import Sticker from '../components/Sticker';
import Node from '../components/Node';

interface NodeType {
  key: string;
  src: string;
  initX: number;
  initY: number;
}

const readImgFile = (img: File) => {
  return new Promise<string | ArrayBuffer>((resovle, reject) => {
    if (img) {
      const reader = new FileReader();
      reader.readAsDataURL(img);
      reader.onload = e => {
        const { target } = e;
        if (target && target.result) {
          resovle(target.result);
        } else {
          reject(new Error('No Image'));
        }
      };
    } else {
      reject(new Error('No Image'));
    }
  });
};

const Workbench = () => {
  const WorkbenchRef: RefObject<HTMLDivElement> = useRef(null);
  const [nodeList, setNodeList] = useState<NodeType[]>([]);
  useEffect(() => {
    // 为document绑定多个拖动事件，消除浏览器默认行为：防止向DrawArea内拖拽图片时浏览器自动跳转
    const DragEventHandle = (event: Event) => {
      event.preventDefault();
    };
    const events = ['dragleave', 'dragenter', 'drop', 'dragover'];
    events.forEach(eventName => {
      document.addEventListener(eventName, DragEventHandle, false);
    });

    const notificationKey = `${new Date().getTime()}-${Math.random()}`;

    notification.open({
      key: notificationKey,
      message: '操作指引',
      description: '将图片拖拽进来就可以对图片进行移动和缩放操作啦~~~',
      duration: null,
      icon: <BulbOutlined style={{ color: '#108ee9' }} />,
      top: 48,
    });

    return () => {
      notification.close(notificationKey);

      // 为DragEventHandle解除事件绑定
      events.forEach(eventName => {
        document.removeEventListener(eventName, DragEventHandle, false);
      });
    };
  }, []);
  return (
    <div
      style={{
        height: '100%',
        padding: 24,
        backgroundColor: '#bae7ff',
      }}
    >
      <div
        ref={WorkbenchRef}
        style={{
          height: '100%',
          position: 'relative',
          borderRadius: 12,
          boxShadow:
            '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
        onContextMenu={e => {
          e.preventDefault();
        }}
        onDrop={e => {
          e.preventDefault();
          if (WorkbenchRef && WorkbenchRef.current) {
            const {
              dataTransfer: { files: fileList = [] } = {},
              clientX,
              clientY,
            } = e;
            // 计算当前鼠标相对工作台的坐标，作为Node的起始位置
            const { scrollLeft = 0, scrollTop = 0 } = WorkbenchRef.current;
            const { left, top } = WorkbenchRef.current.getBoundingClientRect();
            let x = clientX + scrollLeft - left;
            let y = clientY + scrollTop - top;

            if (fileList.length > 0) {
              const [img] = fileList;
              if (img) {
                readImgFile(img).then(imgBase64Code => {
                  const imgBase64CodeString: string = imgBase64Code as string;

                  // 预先读取image的尺寸，将其中心点调整为鼠标对应的坐标位置
                  const tmpImg = new Image();
                  tmpImg.onload = e => {
                    const { target } = e;
                    const {
                      width = 0,
                      height = 0,
                    } = target as HTMLImageElement;
                    const newNode: NodeType = {
                      key: `${new Date().getTime()}`,
                      src: imgBase64CodeString,
                      initX: x - Math.round(width / 2),
                      initY: y - Math.round(height / 2),
                    };
                    setNodeList(prevNodeList => {
                      return [...prevNodeList, newNode];
                    });
                  };
                  tmpImg.src = imgBase64CodeString;
                });
              }
            }
          }
        }}
      >
        <Sticker
          style={{
            top: 48,
            left: 48,
          }}
          title="返回首页"
        >
          <Button
            size="large"
            type="primary"
            shape="circle"
            style={{
              width: 52,
              height: 52,
              fontSize: 26,
            }}
            icon={<ArrowLeftOutlined style={{ fontSize: 26 }} />}
            onClick={e => {
              e.preventDefault();
              history.replace('/');
            }}
          />
        </Sticker>
        {nodeList.map(item => {
          return (
            <Node
              key={item.key}
              src={item.src}
              parentRef={WorkbenchRef}
              style={{
                position: 'absolute',
                top: item.initY,
                left: item.initX,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Workbench;
