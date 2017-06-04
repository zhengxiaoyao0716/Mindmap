import dva from 'dva';
import { browserHistory } from 'dva/router';
import './index.css';

// 1. Initialize
const app = dva({
  history: browserHistory,
});

// 2. Plugins
app.use(require('dva-loading')());

// 3. Model
app.model(require('./models/account.js'));
app.model(require('./models/contact.js'));
app.model(require('./models/project.js'));
app.model(require('./models/project_detail.js'));
app.model(require('./models/project_message.js'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
