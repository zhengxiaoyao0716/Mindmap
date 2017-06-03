import React from 'react';
import { Collapse, Popconfirm, Button } from 'antd';
const Panel = Collapse.Panel;

import ChildPage from './../components/ChildPage';

const ProjectDetail = ({
  account: { baseInfo },
  projectDetail: {
    id, name, describe, create_time: createTime, status, is_owner: isOwner, owner, members,
  },
}) => {
  function removeMember(memberId) {
    console.log(id, memberId);
  }
  function buildUserPanel({ name: useName, account, email, phone }) {
    return (
      <div>
        <p>姓名：{useName}</p>
        <p>帐号：{account}</p>
        <p>邮箱：{email}</p>
        <p>手机号：{phone}</p>
      </div>);
  }
  return (
    <ChildPage menus={[
      {
        text: '项目详情',
        icon: 'pie-chart',
        children: (
          <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header="基础信息" key={1}>
              <div>
                <p>名称：{name}</p>
                <p>描述：{describe}</p>
                <p>创建时间：{createTime}</p>
                <p>状态：{status}</p>
              </div>
            </Panel>
            <Panel header="项目所有者" key={2}>
              {owner && buildUserPanel(owner)}
            </Panel>
            <Panel header="项目成员" key={3}>
              <Collapse>
                {members && members.map((user, index) => (
                  <Panel header={isOwner && baseInfo.id !== user.id ?
                    <p>{user.name}
                      <Popconfirm title="将该用户从项目中踢出？" onConfirm={() => removeMember(user.id)}>
                        <Button style={{ marginLeft: '20px' }}>移除</Button>
                      </Popconfirm>
                    </p> :
                    user.name} key={index}>
                    {buildUserPanel(user)}
                  </Panel>
                ))}
              </Collapse>
            </Panel>
          </Collapse>
        ),
      },
    ]} />
  );
};

import { connect } from 'dva';
export default connect(({ account, projectDetail }) => ({ account, projectDetail }))(ProjectDetail);
