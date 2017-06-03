import React from 'react';

import ChildPage from './../components/ChildPage';

const ProjectEditor = ({
  account: { baseInfo },
  projectDetail: {
    id, name, describe, create_time: createTime, status, is_owner: isOwner, owner, members,
  },
  projectMessage,
}) => {
  return (
    <ChildPage style={{ height: '100px' }} menus={[
      {
        text: '编辑',
        icon: 'edit',
        children: (
          <div style={{ height: '100%', width: '100%', backgroundColor: '#fff' }}>
            <canvas width="100%" height="100%"></canvas>
          </div>
        ),
      },
    ]} />
  );
};

import { connect } from 'dva';
export default connect(({ account, projectDetail, projectMessage }) =>
  ({ account, projectDetail, projectMessage }))(ProjectEditor);
