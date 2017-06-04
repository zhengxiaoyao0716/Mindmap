import React from 'react';
import PropTypes from 'prop-types';

import {
  Form, Icon, Input, Button, Modal, Spin,
} from 'antd';
const FormItem = Form.Item;

import QRCode from 'qrcode.react';

import { generateInvitation } from './../services/project';
import { sessionStorage } from './../utils/storage';

/* eslint-disable react/no-multi-comp */

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      CreateDialog: false,
    };
    this.props.hook(this);
  }
  show = () => {
    this.setState({ CreateDialog: true });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { name, description }) => {
      if (err) {
        return;
      }
      this.props.dispatch({ type: 'project/create', payload: { name, description } });
      this.setState({ CreateDialog: false });
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <span>
        <span>创建新项目</span>
        <Modal title="需要您输入一些信息" visible={this.state.CreateDialog} footer={null}
          onCancel={() => { this.setState({ CreateDialog: false }); }}>
          <Form onSubmit={this.handleSubmit} style={styles.form}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [
                  { min: 4, max: 50, message: '项目名称要求4到50位' },
                  { required: true, message: '请输入项目名' },
                ],
              })(
                <Input prefix={<Icon type="layout" style={{ fontSize: 13 }} />} placeholder="项目名" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {
                rules: [{ max: 255, message: '项目描述要求255字内' }],
              })(
                <Input prefix={<Icon type="edit" style={{ fontSize: 13 }} />} placeholder="项目描述" />,
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={styles.formButton}>
                创建
          </Button>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

class Invitation extends React.Component {
  static propTypes = {
    projectId: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);

    const storageKey = `invitation_${props.projectId}`;
    this.state = {
      invitation: (() => {
        const [expires, invitation] = (sessionStorage.getItem(storageKey) || ',').split(',');
        return expires && expires > new Date().valueOf() ? invitation : null;
      })(),
    };
    this.state.invitation ||  // eslint-disable-line no-unused-expressions
      this.generateInvitation(props.projectId, storageKey);
  }
  generateInvitation = (projectId, storageKey) => {
    generateInvitation(projectId).then((invitation) => {
      sessionStorage.setItem(storageKey, `${new Date().valueOf() + (10 * 60 * 1000)},${invitation}`);
      this.setState({ invitation });
    });
  }
  render() {
    return (
      <div>
        {this.state.invitation ? <QRCode value={this.state.invitation} size={240} /> : <Spin size="large" />}
      </div>
    );
  }
}

const [CreateForm, InvitationForm] =
  [Create, Invitation].map(component => Form.create()(component));
export { CreateForm, InvitationForm };

const styles = {
  form: {
    maxWidth: '300px',
    margin: 'auto',
  },
  formButton: {
    width: '100%',
  },
};
