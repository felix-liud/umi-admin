import React, { useEffect } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { Dispatch, Action } from 'redux';
import { Form, Row, Col, Tree } from 'antd';
import { connect } from 'dva';
import { StateType } from './model';
import { MenuTreeItem, SysMenu } from './data';

type ActionType = 'sysMenu/fetchMenus'
  | 'sysMenu/queryMenuInfo'
  | 'sysMenu/delete'
  | 'sysMenu/saveFormValues'
  | 'sysMenu/insert'
  | 'sysMenu/update'
  | 'sysMenu/updateOneTreeNode'
  | 'sysMenu/saveOrder'
  | 'sysMenu/saveMenus';

interface Props extends FormComponentProps {
  dispatch: Dispatch<Action<ActionType>>;
  // treeData: MenuTreeItem[];
  // menuForm: SysMenu;
  sysMenu: StateType;
}

export const SysMenuType = {
  MENU: 10,
  BUTTON: 20,
};

const { TreeNode } = Tree;


const Menu: React.FC<Props> = (
  { dispatch, sysMenu }
) => {
  let { treeData, menuForm } = sysMenu;

  useEffect(() => {
    dispatch && dispatch({
      type: 'sysMenu/fetchMenus',
    });
  }, [])

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
  return (
    <Row>
      <Col md={8} lg={6} xl={6}>
        <Tree
          className="draggable-tree"
          draggable
          blockNode
        >
          {renderTreeNodes(treeData)}
        </Tree>
      </Col>
      <Col md={16} lg={6} xl={4} xxl={4}>2</Col>
    </Row>
  )
}

const FormFC = Form.create<Props>()(Menu);
// export default FormFC;
export default connect(({ sysMenu }: { sysMenu: StateType }) => {
  return {sysMenu};
})(FormFC);