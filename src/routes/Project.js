import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Popconfirm, Button,
} from 'antd';

import Page from './../components/Page';
import { CreateProject } from './../components/Project';

const ProjectList = ({ projects }, { dispatch }) => {
  function onDelete(id) {
    dispatch({ type: 'project/delete', payload: id });
  }
  function onRemove(id) {
    dispatch({ type: 'project/remove', payload: id });
  }
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
      render: (text, record) => {
        return (
          record.is_owner ?
            <Popconfirm title="删除项目" onConfirm={() => onDelete(record.id)}>
              <Button>删除</Button>
            </Popconfirm> :
            <Popconfirm title="退出项目" onConfirm={() => onRemove(record.id)}>
              <Button>退出</Button>
            </Popconfirm>
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
};
ProjectList.propTypes = {
  projects: PropTypes.array.isRequired,
};

let createProjectForm;
const Project = ({ dispatch, project }) => {
  return (
    <Page menus={[
      {
        text: '我的项目',
        icon: 'pie-chart',
        children: [
          {
            text: <CreateProject
              hook={(form) => { createProjectForm = form; }}
              dispatch={dispatch} />,
            icon: 'plus-circle',
            children: () => { createProjectForm.show(); },
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
