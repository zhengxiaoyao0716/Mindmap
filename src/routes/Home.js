import React from 'react';

import {
  Tabs, Tag, Icon,
} from 'antd';

import Sign from './../components/Sign';

class Home extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  state = {
    step: 0,
  }
  render() {
    return (
      <div style={styles.body}>
        <Tabs
          defaultActiveKey="0"
          tabPosition="left"
          style={styles.tabs}
        >
          {[
            {
              name: '功能介绍',
              content: <div>
                <p style={styles.secondTitle}>Mindmap</p>
                <p style={styles.title}>思维导图</p>
                <p><Icon type="github" /> <a href="https://github.com/zhengxiaoyao0716/Mindmap">到GitHub查看</a></p>
                <br />
                <div>
                  <Tag color="pink">在线编辑</Tag>
                  <Tag color="red">多人协作</Tag>
                  <Tag color="orange">快速成型</Tag>
                  <Tag color="green">一键导出</Tag>
                  <Tag color="cyan">H5分享</Tag>
                  <Tag color="blue">开源</Tag>
                  <Tag color="purple">免费</Tag>
                </div>
              </div>,
            },
            {
              name: '01',
              content: <div>具体功能介绍01</div>,
            },
            {
              name: '02',
              content: <div>具体功能介绍02</div>,
            },
            {
              name: '03',
              content: <div>具体功能介绍03</div>,
            },
            {
              name: '快速开始',
              content: <div>
                <p style={styles.thirdTitle}>{['一个邮箱只能注册一个账户！', '验证码已发到您的邮箱！', '准备好了吗？让我们开始吧！'][[this.state.step]]}</p>
                <Sign
                  onNext={() => this.setState({ step: this.state.step + 1 })}
                  onSubmit={() => this.context.router.replace('/account')}
                />
              </div>,
            },
          ].map(({ name, content }, index) => (
            <Tabs.TabPane tab={name} key={index}>{content}</Tabs.TabPane>
          ))}
        </Tabs>
        <footer style={{ textAlign: 'center' }}>
          Mindmap ©2017 Created by zhengxiaoyao0716.
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
    backgroundColor: '#fff',
    padding: '20px',
    height: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '5em',
  },
  secondTitle: {
    fontSize: '3em',
  },
  thirdTitle: {
    fontSize: '2em',
  },
};

import { connect } from 'dva';
export default connect()(Home);
