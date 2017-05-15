import React from 'react';

import {
  Layout, Menu, Icon, Breadcrumb,
} from 'antd';
const { Sider, Content } = Layout;

class Page extends React.Component {
  constructor(props) {
    super(props);

    function findFirst(menu, parenText) {
      const text = parenText + menu.text;
      return menu.children instanceof Array ? findFirst(menu.children[0], `${text}-`) : text;
    }
    /* eslint-disable no-undef */
    this.location = window.location;
    /* eslint-enable no-undef */
    this.state = {
      collapsed: false,
      mode: 'inline',
      select: this.location.hash ? this.location.hash.slice(1) : findFirst(this.props.menus[0], ''),
    };
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
      return children instanceof Function ?
        <Menu.Item ref={(item) => {
          if (item) {
            /* eslint-disable no-param-reassign */
            item.onClick = children;
            /* eslint-enable no-param-reassign */
          }
        }} key={key}>{content}</Menu.Item>
        : <Menu.Item key={key}>{content}</Menu.Item>;
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
          {this.contents[this.state.select]}
        </Content>
      </Layout>
    );
  }
}

export default Page;
