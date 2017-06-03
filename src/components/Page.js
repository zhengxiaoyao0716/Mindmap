import React from 'react';

import {
  Layout, Menu, Icon, Breadcrumb, Spin, Modal,
} from 'antd';
const { Sider, Content } = Layout;

import localStorage from './../utils/storage';
import { SigninForm } from './../components/Sign';

export const event = {
  handles: {},
  on(pathname, handleDispatch) {
    if (!event.handles[pathname]) {
      event.handles[pathname] = [];
    }
    event.handles[pathname].push(handleDispatch);
  },
  emit(location) {
    event.handles[location.pathname] && event.handles[location.pathname].forEach(handle => handle(location));  // eslint-disable-line
  },
};

function checkLogin(account, location) {
  if (account.baseInfo == null) {
    if (localStorage.getItem('remember')) {
      this.props.dispatch({
        type: 'account/autoLogin',
        payload: () => this.setState({
          loading: true,
          loginDialog: true,
          loggedIn: false,
        }),
      });
      return {
        loading: true,
        spinning: '正在自动为您登录',
        loggedIn: false,
      };
    } else {
      return {
        loading: true,
        loginDialog: true,
        loggedIn: false,
      };
    }
  }
  if (!this.state || !this.state.loggedIn) {
    event.emit(location);
    return {
      loading: false,
      loggedIn: true,
    };
  }
}

class Page extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  }
  constructor(props, { location }) {
    super(props);

    function findFirst(menus, parenText) {
      const menu = (() => {
        let index = 0;
        while (menus[index].children instanceof Function) {
          index += 1;
        }
        return menus[index];
      })();
      const text = parenText + menu.text;
      return menu.children instanceof Array ? findFirst(menu.children, `${text}-`) : text;
    }
    this.state = {
      collapsed: false,
      mode: 'inline',
      select: location.hash ? location.hash.slice(1) : findFirst(this.props.menus, ''),
      ...(checkLogin.call(this, props.account, location)),
    };
  }
  componentWillReceiveProps(props, { location }) {
    this.setState({
      select: location.hash ? location.hash.slice(1) : this.state.select,
      ...(checkLogin.call(this, props.account, location)),
    });
  }

  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });
  }
  onSelect = ({ key }) => {
    this.context.router.push(`${this.context.location.pathname}#${key}`);
    this.setState({ select: key });
  }

  contents = {}
  buildMenu = (menus, parentKey = '') => {
    return menus.map(({ text, icon, children }, index) => {
      if (text == null) {
        const Hr = () => <hr />;
        return <Hr key={index} />;
      }
      const content = icon ?
        <span><Icon type={icon} /><span className="nav-text">{text}</span></span> : text;
      const key = parentKey + text;
      if (children instanceof Array) {
        return (
          <Menu.SubMenu key={key} title={content}>
            {this.buildMenu(children, `${key}-`)}
          </Menu.SubMenu>
        );
      }
      this.contents[key] = children;
      return (<Menu.Item key={key} disabled={this.state.loading} {
        ...(() => {
          return children instanceof Function ? {
            ref: (item) => {
              if (item) {
                item.onClick = children;  // eslint-disable-line no-param-reassign
              }
            },
          } : {};
        })()
      } >{content}</Menu.Item>);
    });
  }

  render() {
    return (
      <Layout style={{ height: '100%' }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <Menu
            onSelect={this.onSelect}
            theme="dark" mode={this.state.mode}
            selectedKeys={[this.state.select]}
            defaultOpenKeys={this.state.select.split('-').slice(0, -1)}>
            {this.buildMenu(this.props.menus)}
          </Menu>
        </Sider>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '12px 0' }}>
            {this.context.location.pathname.split('/').slice(1).map((nav, index) => (
              <Breadcrumb.Item key={index}>{nav}</Breadcrumb.Item>
            ))}
            <Breadcrumb.Item key="selectMenu">{this.state.select}</Breadcrumb.Item>
          </Breadcrumb>
          <Spin spinning={this.state.loading} tip={this.state.spinning} delay={500} >
            {this.contents[this.state.select]}
          </Spin>
          <Modal title="请先登录后再操作" visible={this.state.loginDialog} footer={null}
            onCancel={() => this.context.router.push('/')}>
            <SigninForm onSubmit={() => this.setState({ loginDialog: false })} />
          </Modal>
        </Content>
      </Layout>
    );
  }
}

import { connect } from 'dva';
export default connect(({ account }) => ({ account }))(Page);
