import { ConnectState } from '@/models/connect';
import { StateType } from '@/models/login';
import { LoginParamsType } from '@/services/login';
import { Alert } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import React, { Component } from 'react';
import { AnyAction, Dispatch } from 'redux';

import LoginComponents from './components/Login';
import styles from './style.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit, VerifyCode } = LoginComponents;
interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

class Login extends Component<LoginProps, LoginState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  handleSubmit = (err: unknown, values: LoginParamsType) => {
    const { type } = this.state;

    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: { ...values, type },
      });
    }
  };

  onTabChange = (type: string) => {
    this.setState({
      type,
    });
  };

  onGetCaptcha = () =>
    new Promise<boolean>((resolve, reject) => {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.validateFields(
        ['mobile'],
        {},
        async (err: unknown, values: LoginParamsType) => {
          if (err) {
            reject(err);
          } else {
            const { dispatch } = this.props;

            try {
              const success = await ((dispatch({
                type: 'login/getCaptcha',
                payload: values.mobile,
              }) as unknown) as Promise<unknown>);
              resolve(!!success);
            } catch (error) {
              reject(error);
            }
          }
        },
      );
    });

  renderMessage = (content: string) => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { userLogin = {}, submitting } = this.props;
    const { status, type: loginType } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab="账户密码登录">
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName
              name="username"
              placeholder={`${'用户名'}: admin or user`}
            />
            <Password
              name="password"
              placeholder={`${'密码'}: ant.design`}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();

                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
            
            <VerifyCode 
              name="verifyCode"
              placeholder={`验证码`}
              rules={[
                {len: 4, message: '验证码长度为4位'}
              ]}
            />
          </Tab>
          <Tab key="mobile" tab="手机号登录">
            {status === 'error' &&
              loginType === 'mobile' &&
              !submitting &&
              this.renderMessage('验证码错误')}
            <Mobile
              name="mobile"
              placeholder="手机号"
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <Captcha
              name="captcha"
              placeholder="验证码"
              countDown={120}
              onGetCaptcha={this.onGetCaptcha}
              getCaptchaButtonText="获取验证码"
              getCaptchaSecondText="秒"
              rules={[
                {
                  required: true,
                  message: '请输入验证码！',
                },
              ]}
            />
          </Tab>
          <Submit loading={submitting}>登录</Submit>
          <div className={styles.other}>
            {/* <Link className={styles.register} to="/user/register">
              注册账户
            </Link> */}
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
