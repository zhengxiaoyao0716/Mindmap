import React from 'react';

import {
  Layout, Menu, Icon, Breadcrumb, Spin, Modal,
} from 'antd';
const { Sider, Content } = Layout;

import localStorage from './../utils/storage';
import { SigninForm } from './../components/Sign';

function checkLogin() {
  if (this.props.account.baseInfo == null) {
    if (localStorage.getItem('remember')) {
      this.props.dispatch({ type: 'account/autoLogin' });
      return {
        loading: true,
        spinning: '正在自动为您登录',
      };
    } else {
      return {
        loading: true,
        loginDialog: true,
      };
    }
  }
  return {
    loading: false,
  };
}

class Page extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    // TODO use context
  }
  constructor(props) {
    super(props);

    function findFirst(menu, parenText) {
      const text = parenText + menu.text;
      return menu.children instanceof Array ? findFirst(menu.children[0], `${text}-`) : text;
    }
    this.location = window.location;  // eslint-disable-line no-undef
    this.state = {
      collapsed: false,
      mode: 'inline',
      select: this.location.hash ? this.location.hash.slice(1) : findFirst(this.props.menus[0], ''),
      ...(checkLogin.call(this)),
    };
  }
  componentWillReceiveProps() {
    this.setState({
      select: this.location.hash ? this.location.hash.slice(1) : this.state.select,
      ...(checkLogin.call(this)),
    });
  }

  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });
  }
  onSelect = ({ key }) => {
    this.location.hash = key;
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
            {this.location.pathname.split('/').slice(1).map((nav, index) => (
              <Breadcrumb.Item key={index}>{nav}</Breadcrumb.Item>
            ))}
            <Breadcrumb.Item key="selectMenu">{this.state.select}</Breadcrumb.Item>
          </Breadcrumb>
          <Spin spinning={this.state.loading} tip={this.state.spinning} delay={500} >
            {this.contents[this.state.select]}
          </Spin>
          <Modal title="请先登录后再操作" visible={this.state.loginDialog} footer={null}
            onCancel={() => this.context.router.replace('/')}>
            <SigninForm onSubmit={() => this.setState({ loginDialog: false })} />
          </Modal>
        </Content>
      </Layout>
    );
  }
}

import { connect } from 'dva';
export default connect(({ account }) => ({ account }))(Page);
