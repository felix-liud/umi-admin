import React, { useEffect, useState } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { Dispatch, Action } from 'redux';
import { StateType, ListType } from './model';
import { Form, Table } from 'antd';
import { connect } from 'dva';
import { ColumnType } from 'antd/lib/list';
import { ColumnProps } from 'antd/lib/table';

type ActionType = 'sysDict/featchDicts';

interface Props extends FormComponentProps {
  dispatch: Dispatch<Action<ActionType>>;
  sysDict: StateType;
}
export interface QueryFieldsType {
  fields: object;
  page: {
    current: number;
    pageSize: number;
  }
}

const columns: ColumnProps<ListType>[] = [
  {
    title: '字典名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '字典标识',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate',
  },
  {
    title: '更新时间',
    dataIndex: 'updateDate',
    key: 'updateDate',
  },
]

const Dict: React.FC<Props> = ({sysDict: { form, list }, dispatch}) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    dispatch && dispatch({
      type: 'sysDict/featchDicts',
      payload: {
        fields: {},
        page: {
          current: 1,
          pageSize: 10
        }
      } as QueryFieldsType,
      callback() {
        setLoading(false);
      }
    })
  }, [])
  return(
    <div>
      <Table dataSource={list} columns={columns} loading={loading}/>;

    </div>
  )  
}

const FormFC = Form.create<Props>()(Dict);
export default connect(({ sysDict }: { sysDict: StateType }) => {
    return { sysDict };
})(FormFC);