import React from 'react';

import {
  Layout, Menu, Icon, Radio,
  LocaleProvider,
} from 'antd';
const { Header, Content } = Layout;
import styles from './Frame.css';

import enUS from 'antd/lib/locale-provider/en_US';
import moment from 'moment';
import 'moment/locale/zh-cn';

class Frame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      route: this.props.children.props.route.path,
      locale: null,
    };
  }

  handleClick = (e) => {
    this.setState({ route: e.key });
    this.context.router.replace(e.key);
  }

  changeLocale = (e) => {
    const localeValue = e.target.value;
    this.setState({ locale: localeValue });
    if (!localeValue) {
      moment.locale('zh-cn');
    } else {
      moment.locale('en');
    }
  }

  render() {
    return (
      <Layout className={styles.body}>
        <Header className={styles.header}>
          <h1 className={styles.header_logo}>Mindmap</h1>
          <Menu className={styles.header_menu}
            onClick={this.handleClick}
            selectedKeys={[this.state.route]}
            mode="horizontal" >
            <Menu.Item key="/">
              <Icon type="home" />
              {this.state.locale ? 'Home' : '首页'}
            </Menu.Item>
            <Menu.Item key="/project">
              <Icon type="layout" />
              {this.state.locale ? 'Project' : '项目'}
            </Menu.Item>
            <Menu.Item key="/contact">
              <Icon type="contacts" />
              {this.state.locale ? 'Contact' : '联系人'}
            </Menu.Item>
            <Menu.Item key="/account">
              <Icon type="user" />
              {this.state.locale ? 'Account' : '用户'}
            </Menu.Item>
          </Menu>
          <div className={styles.header_padding}></div>
          <Radio.Group className={styles.header_radio}
            onChange={this.changeLocale}>
            <Radio.Button key="en" value={enUS}>En</Radio.Button>
            <Radio.Button key="cn">中文</Radio.Button>
          </Radio.Group>
        </Header>
        <Content className={styles.content}>
          <LocaleProvider locale={this.state.locale}>
            {this.props.children}
          </LocaleProvider>
        </Content>
      </Layout>
    );
  }
}

Frame.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Frame;
