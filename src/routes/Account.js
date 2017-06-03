import React from 'react';
import { Modal } from 'antd';

import { logout } from './../services/user';
import Page from './../components/Page';
import localStorage from './../utils/storage';

class Message extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

function Account({ dispatch }, { router }) {
  return (
    <Page menus={[
      {
        text: '消息中心',
        icon: 'bell',
        children: [
          {
            text: '未读',
            icon: 'bulb',
            children: <Message>未读</Message>,
          },
          {
            text: '标记',
            icon: 'flag',
            children: null,
          },
          {
            text: '系统通知',
            icon: 'notification',
            children: null,
          },
          {
            text: '收件箱',
            icon: 'inbox',
            children: null,
          },
        ],
      },
      {
        text: '个人设置',
        icon: 'setting',
        children: [
          {
            text: '基本信息',
            icon: 'idcard',
            children: null,
          },
          {
            text: '通知提醒',
            icon: 'shake',
            children: null,
          },
        ],
      },
      {
        text: '账户安全',
        icon: 'safety',
        children: [
          {
            text: '密码验证',
            icon: 'key',
            children: null,
          },
          {
            text: '帐号绑定',
            icon: 'link',
            children: null,
          },
        ],
      },
      {
        text: '反馈',
        icon: 'export',
        children: null,
      },
      {},
      {
        text: '登出',
        icon: 'logout',
        children: () => {
          Modal.confirm({
            content: '您确定要退出登录？',
            cancelText: '不，点错了',
            okText: '是的',
            onOk: () => logout().catch(() => { }).then(() => {
              localStorage.removeItem('remember');
              router.push('/');
              dispatch({ type: 'account/saveBaseInfo', payload: null });
            }),
            iconType: null,
            maskClosable: true,
          });
        },
      },
    ]} />
  );
}

Account.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

import { connect } from 'dva';
export default connect(({ account }) => ({ account }))(Account);
