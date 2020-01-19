import { Form, Tabs, Checkbox } from 'antd';
import React, { Component } from 'react';
import { FormComponentProps } from 'antd/es/form';
import classNames from 'classnames';
import LoginContext, { LoginContextProps } from './LoginContext';
import LoginItem, { LoginItemProps, LoginItemType } from './LoginItem';

import LoginSubmit from './LoginSubmit';
import LoginTab from './LoginTab';
import styles from './index.less';
import { LoginParamsType } from '@/services/login';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

export interface LoginProps {
  defaultActiveKey?: string;
  onTabChange?: (key: string) => void;
  style?: React.CSSProperties;
  onSubmit?: (error: unknown, values: LoginParamsType) => void;
  className?: string;
  form: FormComponentProps['form'];
  onCreate?: (form?: FormComponentProps['form']) => void;
  children: React.ReactElement<typeof LoginTab>[];
}

interface LoginState {
  tabs?: string[];
  type?: string;
  active?: { [key: string]: unknown[] };
  rememberMe?: boolean
}

class Login extends Component<LoginProps, LoginState> {
  public static Tab = LoginTab;

  public static Submit = LoginSubmit;

  public static UserName: React.FunctionComponent<LoginItemProps>;

  public static VerifyCode: React.FunctionComponent<LoginItemProps>;

  public static Password: React.FunctionComponent<LoginItemProps>;

  public static Mobile: React.FunctionComponent<LoginItemProps>;

  public static Captcha: React.FunctionComponent<LoginItemProps>;

  static defaultProps = {
    className: '',
    defaultActiveKey: '',
    onTabChange: () => { },
    onSubmit: () => { },
  };

  constructor(props: LoginProps) {
    super(props);
    this.state = {
      type: props.defaultActiveKey,
      tabs: [],
      active: {},
      rememberMe: true
    };
  }

  componentDidMount() {
    const { form, onCreate } = this.props;
    if (onCreate) {
      onCreate(form);
    }
  }

  onSwitch = (type: string) => {
    this.setState(
      {
        type,
      },
      () => {
        const { onTabChange } = this.props;
        if (onTabChange) {
          onTabChange(type);
        }
      },
    );
  };
  rememberMeChange = (e: CheckboxChangeEvent) => {
    this.setState({
      rememberMe: e.target.checked
    })
  }

  getContext: () => LoginContextProps = () => {
    const { form } = this.props;
    const { tabs = [] } = this.state;
    return {
      tabUtil: {
        addTab: id => {
          this.setState({
            tabs: [...tabs, id],
          });
        },
        removeTab: id => {
          this.setState({
            tabs: tabs.filter(currentId => currentId !== id),
          });
        },
      },
      form: { ...form },
      updateActive: activeItem => {
        const { type = '', active = {} } = this.state;
        if (active[type]) {
          active[type].push(activeItem);
        } else {
          active[type] = [activeItem];
        }
        this.setState({
          active,
        });
      },
    };
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { active = {}, type = '' } = this.state;
    const { form, onSubmit } = this.props;
    const activeFields = active[type] || [];
    active[type].push('rememberMe');
    if (form) {
      form.validateFields(activeFields as string[], { force: true }, (err, values) => {
        if (onSubmit) {
          onSubmit(err, values);
        }
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const { className, children } = this.props;
    const { type, tabs = [], rememberMe } = this.state;
    const TabChildren: React.ReactComponentElement<typeof LoginTab>[] = [];
    const otherChildren: React.ReactElement<unknown>[] = [];
    React.Children.forEach(
      children,
      (child: React.ReactComponentElement<typeof LoginTab> | React.ReactElement<unknown>) => {
        if (!child) {
          return;
        }
        if ((child.type as { typeName: string }).typeName === 'LoginTab') {
          TabChildren.push(child as React.ReactComponentElement<typeof LoginTab>);
        } else {
          otherChildren.push(child);
        }
      },
    );
    return (
      <LoginContext.Provider value={this.getContext()}>
        <div className={classNames(className, styles.login)}>
          <Form onSubmit={this.handleSubmit}>
            {tabs.length ? (
              <React.Fragment>
                <Tabs
                  animated={false}
                  className={styles.tabs}
                  activeKey={type}
                  onChange={this.onSwitch}
                >
                  {TabChildren}
                </Tabs>

                <Form.Item style={{margin: 0}}>
                  {getFieldDecorator('rememberMe', {
                    valuePropName: 'rememberMe',
                    initialValue: true,
                  })(
                    <Checkbox checked={rememberMe} onChange={this.rememberMeChange}>
                      自动登录
                        </Checkbox>)}
                  <a style={{ float: 'right', }} href="" >
                    忘记密码
                      </a>
                </Form.Item>
                {otherChildren}
              </React.Fragment>
            ) : (
                children
              )}
          </Form>
        </div>
      </LoginContext.Provider>
    );
  }
}

(Object.keys(LoginItem) as (keyof LoginItemType)[]).forEach(item => {
  Login[item] = LoginItem[item];
});

export default Form.create<LoginProps>()(Login);
