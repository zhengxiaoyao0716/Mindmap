import React from 'react';

import PropTypes from 'prop-types';
import {
  Table, Popconfirm, Button,
} from 'antd';

import Page from './../components/Page';
import { AddContactForm } from './../components/Contact';

const ContactList = ({ contact }, { dispatch }) => {
  function onDelete(id) { dispatch({ type: 'contact/delete', payload: id }); }
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    }, {
      title: '帐号',
      dataIndex: 'account',
    }, {
      title: '操作',
      render: (text, { id }) => {
        return (
          <div>
            <Popconfirm title="删除联系人" onConfirm={() => onDelete(id)}>
              <Button>删除</Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <Table
        dataSource={contact}
        columns={columns}
      />
    </div>
  );
};

ContactList.contextTypes = {
  dispatch: PropTypes.func.isRequired,
};
ContactList.propTypes = {
  // projects: PropTypes.array.isRequired,
};

let addContactForm;
const Contact = ({ dispatch, contact }) => {
  return (
    <Page menus={[
      {
        text: '我的项目',
        icon: 'pie-chart',
        children: [
          {
            text: <AddContactForm
              hook={(form) => { addContactForm = form; }}
              dispatch={dispatch} />,
            icon: 'user-add',
            children: () => { addContactForm.show(); },
          },
          {
            text: '全部联系人',
            icon: 'contacts',
            children: <ContactList contact={contact} />,
          },
        ],
      },
    ]} />
  );
};

import { connect } from 'dva';
export default connect(({ contact }) => ({ contact }))(Contact);
