import React from 'react';

import { Tabs, Radio } from 'antd';
const TabPane = Tabs.TabPane;

class Home extends React.Component {
  render() {
    return (
      <div style={styles.body}>
        <Tabs
          defaultActiveKey="1"
          tabPosition="left"
          style={styles.tabs}
        >
          {[
            {
              name: '功能介绍',
              content: <div>功能介绍</div>,
            },
            {
              name: '快速开始',
              content: <div>快速开始</div>,
            },
            {
              name: '。。。',
              content: <div>其它乱七八糟的</div>,
            },
            {
              name: '功能介绍',
              content: <div>功能介绍</div>,
            },
            {
              name: '快速开始',
              content: <div>快速开始</div>,
            },
            {
              name: '。。。',
              content: <div>其它乱七八糟的</div>,
            },
          ].map(({ name, content }, index) => <TabPane tab={name} key={index}>{content}</TabPane>)}
        </Tabs>
        <footer style={{ textAlign: 'center' }}>
          Ant Design ©2016 Created by Ant UED
        </footer>
      </div>
    );
  }
}

const styles = {
  body: {
    height: '100%',
    padding: '30px',
  },
  tabs: {
    height: '100%',
  },
};

export default Home;
