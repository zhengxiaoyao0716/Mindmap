import React from 'react';

import {
  Form, Icon, Input, Button, Modal,
} from 'antd';
const FormItem = Form.Item;

class CreateProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createProjectDialog: false,
    };
    this.props.hook(this);
  }
  show = () => {
    this.setState({ createProjectDialog: true });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { name, description }) => {
      if (err) {
        return;
      }
      this.props.dispatch({ type: 'project/create', payload: { name, description } });
      this.setState({ createProjectDialog: false });
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <span>
        <span>创建新项目</span>
        <Modal title="需要您输入一些信息" visible={this.state.createProjectDialog} footer={null}
          onCancel={() => { this.setState({ createProjectDialog: false }); }}>
          <Form onSubmit={this.handleSubmit} style={styles.form}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [
                  { min: 4, max: 50, message: '项目名称要求4到50位' },
                  { required: true, message: '请输入项目名' },
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="项目名" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {
                rules: [{ max: 255, message: '项目描述要求255字内' }],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="项目描述" />,
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

export const CreateProject = Form.create()(CreateProjectForm);

const styles = {
  form: {
    maxWidth: '300px',
    margin: 'auto',
  },
  formButton: {
    width: '100%',
  },
};
