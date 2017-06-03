import React from 'react';
import PropTypes from 'prop-types';

import Page from './../components/Page';

const ChildPage = ({ menus, style }, { router }) => (
  <Page menus={[
    ...menus,
    {
      text: '返回',
      icon: 'arrow-left',
      children: () => router.goBack(),
    },
  ]} style={style} />
);

ChildPage.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ChildPage;