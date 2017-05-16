import React from 'react';

import Page from './../components/Page';

const Project = () => (
  <Page menus={[
    {
      text: '我的项目',
      icon: 'pie-chart',
      children: [
        {
          text: '进行中',
          icon: 'right-square-o',
          children: null,
        },
        {
          text: '重点标记',
          icon: 'book',
          children: null,
        },
        {
          text: '全部',
          icon: 'folder',
          children: null,
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

export default Project;
