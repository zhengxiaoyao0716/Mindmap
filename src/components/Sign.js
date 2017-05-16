import React from 'react';

import {
  Steps, Form, Icon, Input, Button, Checkbox, Modal,
} from 'antd';
const FormItem = Form.Item;

import { login, getVerifyCode, resetPasseord } from './../services/user';
import localStorage from './../utils/storage';

/* eslint-disable react/no-multi-comp */

class Signup extends React.Component {
  state = {
    submitButton: {},
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { email, account }) => {
      if (err) {
        this.props.onError(err);
        return;
      }
      this.setState({ submitButton: { loading: true } });
      getVerifyCode(email, account)
        .then((d) => {
          this.setState({ submitButton: { disabled: true } });
          return d;
        })
        .then(this.props.onSubmit)
        .catch(this.props.onError);
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={styles.form}>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: '这不是有效的邮箱格式',
            }, {
              required: true, message: '请输入电子邮箱',
            }],
          })(
            <Input prefix={<Icon type="mail" style={{ fontSize: 13 }} />} placeholder="邮箱" />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('account', {
            rules: [
              { min: 5, max: 30, message: '账户长度要求5到30位' },
              { pattern: /^\w{5,30}$/, message: '只允许数字字母下划线' },
              { required: true, message: '请输入账户名' },
            ],
          })(
            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="账户名" />,
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={styles.formButton} {...this.state.submitButton}>
            {this.state.submitButton.disabled ? '验证邮件已发送' : '发送验证邮件'}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

class Verify extends React.Component {
  state = {
    cooldown: 60,
    submitButton: {},
  }
  componentDidMount() {
    this.interval = setInterval(
      () => this.state.cooldown > 0 && this.setState({ cooldown: this.state.cooldown - 1 }),
      1000,
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  resendCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.cooldown > 0) {
      return;
    }
    Modal.confirm({
      title: '需要验证您的信息',
      content: <SignupForm onSubmit={() => this.setState({ cooldown: 60 })} />,
      okText: '完成了，回去验证',
      cancelText: '放弃',
      // footer: null,
      maskClosable: true,
    });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { code, password }) => {
      if (err) {
        this.props.onError(err);
        return;
      }
      this.setState({ submitButton: { loading: true } });
      resetPasseord(code, password)
        .then((d) => {
          this.setState({ submitButton: { disabled: true } });
          return d;
        })
        .then(this.props.onSubmit)
        .catch(this.props.onError);
    });
  }

  handleConfirmPassword = (rule, value, callback) => {
    return callback(value === this.props.form.getFieldValue('password') ? undefined : '确认密码与原密码不一致');
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={styles.form}>
        <FormItem>
          {getFieldDecorator('code', {
            rules: [{ pattern: /^\d{6}$/, message: '验证码应为6位数字' }, { required: true, message: '请输入验证码' }],
          })(
            <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="string" placeholder="验证码" />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ min: 6, max: 20, message: '密码长度应为6~20位' }, { required: true, message: '请设置登录密码' }],
          })(
            <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('confirm', {
            rules: [{ validator: this.handleConfirmPassword }, { required: true, message: '请再次输入密码以确认' }],
          })(
            <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="确认密码" />,
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={styles.formButton} {...this.state.submitButton}>
            {this.state.submitButton.disabled ? '密码已重置' : '提交登录密码'}
          </Button>
          {this.state.cooldown > 0 ?
            <p>{this.state.cooldown}s 后可以重发验证码</p> :
            <p>没收到验证码？<a onClick={this.resendCode}> 再次发送</a></p>}
        </FormItem>
      </Form>
    );
  }
}

class Signin extends React.Component {
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  }
  state = {
    submitButton: {},
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { account, password, remember }) => {
      if (err) {
        this.props.onError(err);
        return;
      }
      this.setState({ submitButton: { loading: true } });
      login(account, password)
        .then((data) => {
          this.context.dispatch({ type: 'account/saveBaseInfo', payload: data });
          this.setState({ submitButton: { disabled: true } });
          if (remember) {
            localStorage.setItem('remember', 'y');
          } else {
            localStorage.removeItem('remember');
          }
          return data;
        })
        .then(this.props.onSubmit)
        .catch(this.props.onError);
    });
  }
  findPassword = () => {
    Modal.confirm({
      title: '需要验证您的信息',
      content: <SignupForm />,
      onOk: () => {
        Modal.confirm({
          title: '设置您的新密码',
          content: <VerifyForm />,
          okText: '完成',
          cancelText: '放弃',
          maskClosable: true,
        });
      },
      okText: '下一步，设置密码',
      cancelText: '放弃',
      maskClosable: true,
    });
  }
  signup = () => {
    return this.findPassword();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={styles.form}>
        <FormItem>
          {getFieldDecorator('account', {
            rules: [
              { min: 5, max: 30, message: '账户长度要求5到30位' },
              { pattern: /^\w{5,30}$/, message: '只允许数字字母下划线' },
              { required: true, message: '请输入登录账户' },
            ],
          })(
            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="账户" />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码' }],
          })(
            <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>记住我</Checkbox>,
          )}
          <p style={styles.formForgot}>密码忘了？<a onClick={this.findPassword}>点我</a>找回</p>
          <Button type="primary" htmlType="submit" style={styles.formButton} {...this.state.submitButton}>
            {this.state.submitButton.disabled ? '已登录' : '登录'}
          </Button>
          没有账号？<a onClick={this.signup}>点这里</a>注册
        </FormItem>
      </Form>
    );
  }
}

const SignForms = [Signup, Verify, Signin].map(component => Form.create()(component));
const [SignupForm, VerifyForm, SigninForm] = SignForms;
export { SignupForm, VerifyForm, SigninForm };

class Sign extends React.Component {
  state = {
    step: 0,
    status: 'process',
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const StepForm = SignForms[this.state.step];
    return (
      <div style={styles.body}>
        <StepForm
          onError={() => this.setState({ status: 'error' })}
          onSubmit={(data) => {
            this.timeout = setTimeout(() => {
              if (this.state.step >= 2) {
                this.props.onSubmit(data);
                return;
              }
              this.setState({
                step: this.state.step + 1,
                status: 'process',
              });
              this.props.onNext();
            }, 500);
          }} />
        <Steps current={this.state.step} status={this.state.status}
          size="small">
          <Steps.Step title="注册" description="系统将发送一封邮件到您的邮箱" />
          <Steps.Step title="验证" description="验证邮箱可用，并设置您的登录密码" />
          <Steps.Step title="登录" description="可以用新的账户名和密码登录了" />
        </Steps>
      </div>
    );
  }
}

export default Sign;

const styles = {
  form: {
    maxWidth: '300px',
    margin: 'auto',
  },
  formForgot: {
    float: 'right',
  },
  formButton: {
    width: '100%',
  },
  body: {
    textAlign: 'left',
  },
};
