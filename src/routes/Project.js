import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Popconfirm, Button, Modal,
} from 'antd';

import Page from './../components/Page';
import { CreateForm, InvitationForm } from './../components/Project';

const ProjectList = ({ projects }, { dispatch, router }) => {
  function editProject(id) { router.push(`/project/edit?project_id=${id}`); }
  function watchDetail(id) { router.push(`/project/detail?project_id=${id}`); }
  function invitationUser(id) {
    Modal.info({
      title: '邀请用户加入',
      content: <InvitationForm projectId={id} />,
      iconType: null,
      okText: '关闭',
      maskClosable: true,
    });
  }
  function onDelete(id) { dispatch({ type: 'project/delete', payload: id }); }
  function onRemove(id) { dispatch({ type: 'project/remove', payload: id }); }
  const columns = [
    {
      title: '项目名',
      dataIndex: 'name',
    }, {
      title: '所有者',
      dataIndex: 'owner',
    }, {
      title: '创建时间',
      dataIndex: 'create_time',
    }, {
      title: '操作',
      render: (text, { id, is_owner: isOwner }) => {
        return (
          <div>
            <Button onClick={() => editProject(id)} type="primary">编辑</Button>
            <Button onClick={() => watchDetail(id)} type="primary">查看详情</Button>
            {isOwner && <Button onClick={() => invitationUser(id)} type="primary">邀请用户</Button>}
            {isOwner ?
              <Popconfirm title="删除项目" onConfirm={() => onDelete(id)}>
                <Button>删除</Button>
              </Popconfirm> :
              <Popconfirm title="退出项目" onConfirm={() => onRemove(id)}>
                <Button>退出</Button>
              </Popconfirm>}
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <Table
        dataSource={projects}
        columns={columns}
      />
    </div>
  );
};

ProjectList.contextTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
};
ProjectList.propTypes = {
  projects: PropTypes.array.isRequired,
};

let createForm;
const Project = ({ dispatch, project }) => {
  return (
    <Page menus={[
      {
        text: '我的项目',
        icon: 'pie-chart',
        children: [
          {
            text: <CreateForm
              hook={(form) => { createForm = form; }}
              dispatch={dispatch} />,
            icon: 'plus-circle',
            children: () => { createForm.show(); },
          },
          {
            text: '正在进行',
            icon: 'right-square-o',
            children: <ProjectList projects={project.filter(({ status }) => status === '正在进行')} />,
          },
          {
            text: '重点标记',
            icon: 'book',
            children: null,
          },
          {
            text: '全部项目',
            icon: 'folder',
            children: <ProjectList projects={project} />,
          },
        ],
      },
      {
        text: '收藏夹',
        icon: 'star-o',
        children: [
          {
            text: '公开',
            icon: 'cloud-o',
            children: null,
          },
          {
            text: '已购',
            icon: 'shopping-cart',
            children: null,
          },
        ],
      },
      {},
      {
        text: '项目广场',
        icon: 'global',
        children: null,
      },
    ]} />
  );
};

import { connect } from 'dva';
export default connect(({ project }) => ({ project }))(Project);
