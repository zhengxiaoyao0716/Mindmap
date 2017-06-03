import React from 'react';

import ChildPage from './../components/ChildPage';
import Mindmap from './../components/Mindmap';
import ChatRoom from './../components/ChatRoom';

const ProjectEditor = ({
  dispatch,
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
            <Mindmap />
            <ChatRoom />
          </div>
        ),
      },
    ]} onBack={() => dispatch({ type: 'projectMessage/leave', payload: {} })} />
  );
};

import { connect } from 'dva';
export default connect(({ account, projectDetail, projectMessage }) =>
  ({ account, projectDetail, projectMessage }))(ProjectEditor);
