import React from 'react';
import {
  Layout, Menu, Icon, Radio,
  LocaleProvider,
} from 'antd';
const { Header, Content } = Layout;
import enUS from 'antd/lib/locale-provider/en_US';

import moment from 'moment';
import 'moment/locale/zh-cn';

import styles from './Frame.css';

class Frame extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  static childContextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);

    this.state = {
      route: `/${this.props.routes[1].path || ''}`,
      locale: null,
    };
  }
  getChildContext() {
    return { dispatch: this.props.dispatch };
  }

  componentWillReceiveProps({ routes }) {
    this.setState({ route: `/${routes[1].path || ''}` });
  }
  handleClick = (e) => {
    // this.setState({ route: e.key });
    this.context.router.push(e.key);
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

import { connect } from 'dva';
export default connect()(Frame);
