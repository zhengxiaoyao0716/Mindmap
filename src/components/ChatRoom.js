import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {
  notification,
  Button, Input, Icon,
} from 'antd';

export const onMessage = (who, what, when) => {
  const trUserName = name => (onMessage.baseInfo.name === name ? '我' : name);
  const message = (
    <p>
      <span>from </span>
      <a onClick={() => onMessage.linkUser(who.account)}
        title={who.account}>{trUserName(who.name || who)}</a>
      <span> : </span>
      {when && <small>[{when.slice(5, -3)}]</small>}
    </p>
  );
  const memberMap = onMessage.memberMap || {};
  const description = what.split(/(@\w{5,30})/g).map(value => (
    value.startsWith('@') ?
      <a onClick={() => onMessage.linkUser(value.slice(1))}
        title={value.slice(1)}>{trUserName(memberMap[value.slice(1)])}</a> :
      <span style={{ wordBreak: 'break-all' }}>{value}</span>
  ));
  notification.open({ message, description, duration: 0 });
};
onMessage.addKnownUser = (user) => {
  onMessage.memberMap = onMessage.memberMap || {};
  onMessage.memberMap[user.account] = user.name;
};

const document = window.document; // eslint-disable-line no-undef

/* eslint-disable react/no-multi-comp */

class ChatPlugin extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };
  state = {
    focus: false,
    model: 'message',
    value: '',
  }
  componentDidMount() {
    onMessage.linkUser = (account) => {
      account && this.setState({ value: `${this.state.value}@${account} ` });
      this.setState({ focus: true });
    };
  }
  onModelChange = () => {
    const value = this.state.value;
    if (this.state.model === 'message') {
      this.setState({ model: 'code', value: value.startsWith('/') ? value : `/${value}` });
    } else {
      this.setState({ model: 'message', value: value.startsWith('/') ? value.slice(1) : value });
    }
  }
  onSubmit = () => {
    const value = this.state.value.trim();
    if (!value) {
      return;
    }
    this.props.dispatch({ type: 'projectMessage/send', payload: value });
    this.setState({ value: '' });
  }
  render() {
    return (
      <div>
        {this.state.focus ?
          <Input
            onPressEnter={this.onSubmit}
            onChange={e => this.setState({ value: e.target.value })}
            ref={(input) => { if (input) { input.focus(); } }}
            value={this.state.value}
            addonBefore={<Icon onClick={this.onModelChange} type={this.state.model} />}
            addonAfter={<Icon onClick={() => this.setState({ focus: false })} type="close" />}
            style={{ minWidth: '600px' }} /> :
          <Button
            onClick={() => this.setState({ focus: true })}
            type="primary" shape="circle" icon="message" size="large" />
        }
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  componentDidMount() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.style.position = 'absolute';
    container.style.bottom = '20px';
    container.style.right = '20px';
    this.container = container;
    ReactDOM.render(<ChatPlugin {...this.props} />, container);
  }
  componentWillReceiveProps({ projectDetail: { members }, account: { baseInfo } }) {
    if (baseInfo) {
      onMessage.baseInfo = baseInfo;
    }
    if (members) {
      onMessage.memberMap = {};
      members.forEach(({ name, account }) => {
        onMessage.memberMap[account] = name;
      });
    }
  }
  componentWillUnmount() {
    this.container.remove();
  }
  render() {
    return null;
  }
}

import { connect } from 'dva';
export default connect(({ projectDetail, account }) => ({ projectDetail, account }))(ChatRoom);
