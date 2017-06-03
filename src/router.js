import React from 'react';
import { Router, Route, IndexRoute } from 'dva/router';

import Frame from './routes/Frame';
import Home from './routes/Home';
import Project from './routes/Project';
import Contact from './routes/Contact';
import Account from './routes/Account';
import ProjectDetail from './routes/ProjectDetail';
import ProjectEditor from './routes/ProjectEditor';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Frame} >
        <IndexRoute component={Home} />
        <Route path="project">
          <IndexRoute component={Project} />
          <Route path="detail" component={ProjectDetail} />
          <Route path="edit" component={ProjectEditor} />
        </Route>
        <Route path="contact" component={Contact} />
        <Route path="account" component={Account} />
      </Route>
    </Router>
  );
}

export default RouterConfig;
