import React, { useEffect, FormEventHandler, useState } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { Dispatch, Action } from 'redux';
import { Form, Row, Col, Tree, Button, Input, message, Radio, Checkbox, Spin, Popconfirm, Icon } from 'antd';
import { connect } from 'dva';
import { StateType } from './model';
import { MenuTreeItem } from './data';
import { SysMenuType } from '@/static/enums';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { RadioChangeEvent } from 'antd/lib/radio';
import { AntTreeNodeSelectedEvent } from 'antd/lib/tree';


type CurrentNodeIdType = string | null;
type FormType = 'edit' | 'insert';

type ActionType = 'sysMenu/fetchMenus'
  | 'sysMenu/fetchMenuById'
  | 'sysMenu/saveMenuForm'
  | 'sysMenu/insertTreeNode'
  | 'sysMenu/deleteTreeNodeById'
  | 'sysMenu/upadateTreeNodeById';

interface Props extends FormComponentProps {
  dispatch: Dispatch<Action<ActionType>>;
  sysMenu: StateType;
}

interface LoadingStatusType {
  tree: boolean;
  form: boolean;
}

const { TreeNode } = Tree;
const formItemLayout = {
  labelCol: {
    span: 5
  },
  wrapperCol: {
    span: 19
  },
};

const Menu: React.FC<Props> = (
  { dispatch, sysMenu, form }
) => {
  let { treeData, menuForm } = sysMenu;

  const { setFieldsValue, getFieldDecorator, validateFields, getFieldsValue } = form;
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ tree: true, form: false })
  const [currentNodeId, setCurrentNodeId] = useState<CurrentNodeIdType>(null);
  const [formType, setFormType] = useState<FormType>('insert');
  const getMenu = () => {
    setLoadingStatus({
      tree: true,
      form: false
    });
    dispatch && dispatch({
      type: 'sysMenu/fetchMenus',
      callback() {
        setLoadingStatus({
          tree: false,
          form: false
        });
      }
    });
  }
  useEffect(() => {
    getMenu();
  }, [])
  useEffect(() => {
    const values = {
      title: menuForm.title,
      type: menuForm.type,
    };
    if (menuForm.type === SysMenuType.MENU) {
      values['url'] = menuForm.url;
      values['icon'] = menuForm.icon;
      values['hide'] = menuForm.hide;
    } else if (menuForm.type === SysMenuType.BUTTON) {
      values['authority'] = menuForm.authority;
    }
    setFieldsValue(values);
  }, [menuForm])

  // 渲染树节点
  const renderTreeNodes = (data: MenuTreeItem[]) =>
    data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.id} title={item.label}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.label} />;
    });
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    validateFields((err, value) => {
      if (err !== null) return;
      if (formType === 'edit') {
        dispatch({
          type: 'sysMenu/upadateTreeNodeById',
          payload: {
            ...value,
            id: currentNodeId
          },
          callback() {
            getMenu();
            message.success('修改成功');
          }
        });
      } else {
        dispatch({
          type: 'sysMenu/insertTreeNode',
          payload: {
            ...value,
            parentId: currentNodeId
          },
          callback() {
            getMenu();
            message.success('新增成功');
          }
        });
      }
      
    });
  }
  const handleTreeSelect = ([id]: string[], e: AntTreeNodeSelectedEvent) => {
    setCurrentNodeId(id ? id : null);
    setFormType(id ? 'edit' : 'insert');
    if (!id) {
      dispatch({
        type: 'sysMenu/saveMenuForm',
      })
    } else {
      setLoadingStatus({
        tree: false,
        form: true
      })
      dispatch({
        type: 'sysMenu/fetchMenuById',
        callback: () => {
          setLoadingStatus({
            tree: false,
            form: false
          });
        },
        payload: { id }
      })
    }
  }

  const handleDelete = _ => {
    dispatch({
      type: 'sysMenu/deleteTreeNodeById',
      payload: {id: currentNodeId },
      callback() {
        getMenu();
        message.success('删除成功');
      }
    })
  }

  return (
    <Row>
      <div style={{marginBottom: '16px'}}>
        <Button type="primary" onClick={() => {
          dispatch({
            type: 'sysMenu/saveMenuForm'
          });
          setFormType('insert') 
        }}>新增</Button>
        { currentNodeId && 
          <Popconfirm
            title="确定删除该菜单及其子菜单？"
            okText="确定"
            cancelText="取消"
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
            onConfirm={handleDelete}
          >
            <Button type="danger" style={{marginLeft: '8px'}} >删除</Button>
          </Popconfirm>
          
        }
      </div>
      <Col xl={6} sm={8} xxl={6} md={8} xs={24}>
        <Spin spinning={loadingStatus.tree}>
          <Tree
            className="draggable-tree"
            draggable
            blockNode
            onSelect={handleTreeSelect}
          >
            {renderTreeNodes(treeData)}
          </Tree>
        </Spin>
      </Col>
      <Col xl={12} sm={16} xxl={8} md={16} xs={24}>
        <Spin spinning={loadingStatus.form}>
          <Form onSubmit={handleSubmit} {...formItemLayout}>
            <Form.Item label="菜单名称">
              {getFieldDecorator('title', {
                rules: [
                  { required: true, message: '名称为必填' },
                  { max: 16, message: '最多16个字符' },
                ],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="菜单类型">
              {getFieldDecorator('type', {
                initialValue: 10,
                rules: [
                  { required: true, message: '菜单类型为必填' },
                ],
              })(
                <Radio.Group name="type" onChange={(e: RadioChangeEvent) => {
                  dispatch({
                    type: 'sysMenu/saveMenuForm',
                    payload: {
                      ...menuForm,
                      type: e.target.value,
                    }
                  });
                }}>
                  <Radio value={SysMenuType['MENU']}>菜单</Radio>
                  <Radio value={SysMenuType['BUTTON']}>按钮</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            {
              menuForm.type === SysMenuType['MENU']
                ?
                (
                  <>
                    <Form.Item label="页面路径">
                      {getFieldDecorator('url', {
                        rules: [
                          { required: true, message: 'url地址' },
                          { max: 16, message: '最多16个字符' },
                        ],
                      })(<Input />)}
                    </Form.Item>

                    <Form.Item label="隐藏菜单">
                      {getFieldDecorator('hide',

                      )(<Checkbox checked={menuForm.hide !== 0} onChange={(e: CheckboxChangeEvent) => {
                        dispatch({
                          type: 'sysMenu/saveMenuForm',
                          payload: {
                            ...getFieldsValue(),
                            hide: +e.target.checked,
                          }
                        })
                      }
                      } />)}
                    </Form.Item>

                    <Form.Item label="图标">
                      {getFieldDecorator('icon', {
                        rules: [
                          { required: true, message: 'url地址' },
                          { max: 16, message: '最多16个字符' },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </>
                )
                :
                (
                  <Form.Item label="权限标识">
                    {getFieldDecorator('authority', {
                      rules: [
                        { required: true, message: '权限标识不能为空' },
                        { max: 16, message: '最多16个字符' },
                      ],
                    })(<Input />)}
                  </Form.Item>
                )
            }

            <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 19, push: 5 }}>
              <Button type="primary" onClick={handleSubmit}>
                {formType === 'edit' ? '修改' : '新增'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Col>
    </Row>
  )
}

const FormFC = Form.create<Props>()(Menu);
export default connect(({ sysMenu }: { sysMenu: StateType }) => {
  return { sysMenu };
})(FormFC);