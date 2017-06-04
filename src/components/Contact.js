import React from 'react';

import {
  Form, Icon, Input, Button, Modal, message,
} from 'antd';
const FormItem = Form.Item;

import { search } from './../services/user';


function buildUserPanel({ name: useName, account, email, phone }) {
  return (
    <div>
      <p><span>{useName} [{account}]</span></p>
      <p><span>邮箱：{email}</span> <span>手机号：{phone}</span></p>
    </div>);
}

/* eslint-disable react/no-multi-comp */

class AddContact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      CreateDialog: false,
      submitButton: {},
      users: [],
    };
    this.props.hook(this);
  }
  show = () => {
    this.setState({ CreateDialog: true });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { keyword }) => {
      if (err) {
        return;
      }
      this.setState({ submitButton: { loading: true } });
      search(keyword).then((users) => {
        if (!users.length) {
          message.info('没有找到符合的用户');
        }
        this.setState({ submitButton: { loading: false }, users });
      });
    });
  }
  addContact = (user) => {
    this.props.dispatch({ type: 'contact/add', payload: user });
    this.setState({ CreateDialog: false });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <span>
        <span>添加联系人</span>
        <Modal title="请输入关键词以查询" visible={this.state.CreateDialog} footer={null}
          onCancel={() => { this.setState({ CreateDialog: false }); }}>
          <FormItem>
            {getFieldDecorator('keyword', {
              rules: [
                { min: 5, max: 30, message: '关键词长度5到30位' },
                { required: true, message: '请输入查询关键词' },
              ],
            })(
              <Input prefix={<Icon type="search" style={{ fontSize: 13 }} />} placeholder="帐号|用户名|邮箱|手机号" />,
            )}
          </FormItem>
          <div>
            {this.state.users.map((user, index) => (
              <div key={index} style={styles.userPanel}>
                {buildUserPanel(user)}
                <Button onClick={() => this.addContact(user)} icon="plus">添加</Button>
              </div>
            ))}
          </div>
          <Form onSubmit={this.handleSubmit} style={styles.form}>
            <FormItem>
              <Button type="primary" htmlType="submit" style={styles.formButton} {...this.state.submitButton}>
                查询
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

const [AddContactForm] =
  [AddContact].map(component => Form.create()(component));
export { AddContactForm };

const styles = {
  form: {
    maxWidth: '300px',
    margin: 'auto',
  },
  formButton: {
    width: '100%',
  },
  userPanel: {
    display: 'flex',
  },
};
