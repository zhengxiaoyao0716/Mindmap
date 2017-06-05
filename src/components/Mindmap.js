// / <reference path="./../../typings/index.d.ts" />
import React from 'react';
import ReactDom from 'react-dom';
import { Popover, Icon, message as Message, Modal } from 'antd';
import * as d3 from 'd3';

export function parseCommand(command) {
  const [path, query = ''] = command.split('?');
  const data = {};
  query.split('&').forEach((kv) => {
    if (!kv) {
      return;
    }
    const [k, v] = kv.split('=');
    data[k] = v;
  });
  return [path, data];
}

export const helper = (() => {
  const document = window.document;  //  eslint-disable-line no-undef
  // /** @type {HTMLDivElement} */
  // let container;
  /** @type {HTMLDivElement} */
  let helperPanel;
  /** @type {function} */
  let dispatch;

  /** @type {HTMLDivElement[]} */
  const userCursors = [];
  const colors = [
    '#FF5252',  // red
    '#4CAF50',  // green
    '#03A9F4',  // blue
    '#E91E63',  // pink
    '#FFEB3B',  // yellow
    '#3F51B5',  // indigo
    // 0x000000,  // black
    // 0x7F7F7F,  // grey
    // 0xFFFFFF,  // white
  ];
  const myFlag = String(Math.random()).slice(2, 10);

  const onDrag = (d) => {
    onDrag.update(
      d3.event.x - onDrag.offset[0], d3.event.y - onDrag.offset[1],
      d.data.path, d.data.id, d.data.name);
  };
  onDrag.update = (x, y, path, id, name) => {
    const backup = onDrag.update;
    onDrag.update = (x, y, path, id, name) => {  // eslint-disable-line no-shadow
      onDrag.update.cache = { x, y, path, id, name };
    };
    onDrag.update(x, y, path, id, name);

    onDrag.timeout = setTimeout(() => {
      const { x, y, path, id, name } = onDrag.update.cache;  // eslint-disable-line no-shadow
      dispatch({
        type: 'projectMessage/send',
        payload: `./node/drag?x=${x}&y=${y}&node=${path}.${id}&flag=${myFlag}&nodeName=${name || id}`,
      });
      onDrag.update = backup;
    }, 100);
  };
  onDrag.start = (d) => {
    onDrag.isDrag = true;
    onDrag.offset = [d3.event.x - d.y, d3.event.y - d.x];
  };
  onDrag.end = (d) => {
    clearTimeout(onDrag.timeout);
    dispatch({
      type: 'projectMessage/send',
      payload: './node/drag',
    });
    if (d.data.id !== onDrag.collide.id && d.data.path !== onDrag.collide.path) {
      const [x, y] = [
        d3.event.x - onDrag.offset[0] - onDrag.collide.x,
        d3.event.y - onDrag.offset[1] - onDrag.collide.y,
      ];
      if (Math.abs(x) + Math.abs(y) < 100) {
        Modal.confirm({
          title: '移动节点',
          content: `确定要将节点 ${d.data.name || d.data.id} 移动到 ${onDrag.collide.data.name || onDrag.collide.data.id} ？`,
          onOk: () => dispatch({
            type: 'projectMessage/send',
            payload: `/node/move?name=${d.data.id}&from=${d.data.path}&to=${onDrag.collide.data.path}.${onDrag.collide.data.id}`,
          }),
        });
      }
    }
    onDrag.isDrag = false;
  };

  let mark;

  const helper = {  //  eslint-disable-line no-shadow
    init(_dispatch) {
      dispatch = _dispatch;
      /* eslint-disable no-undef */
      // container = document.querySelector('#d3container>svg');
      helperPanel = document.querySelector('#helperPanel');
      /* eslint-enable no-undef */

      mark = document.createElement('div');
      mark.style.position = 'absolute';
      ReactDom.render(<Icon type="bulb" style={{
        fontSize: '30px',
        color: 'green',
      }} />, mark);
      mark.style.display = 'none';
      helperPanel.appendChild(mark);
    },
    addUserCursor(user, flag) {
      const div = document.createElement('div');
      helperPanel.appendChild(div);
      div.style.position = 'absolute';
      div.title = user.name;
      ReactDom.render(<Icon type="smile-o" style={{
        fontSize: '30px',
        color: colors[flag % colors.length],
      }} />, div);

      const nodeName = document.createElement('div');
      helperPanel.appendChild(nodeName);
      nodeName.style.position = 'absolute';

      userCursors[user.id] = { div, nodeName };
      return userCursors[user.id];
    },
    updateUserCursor(user, xy, flag, nodeName = '') {
      const cursor = userCursors[user.id] || helper.addUserCursor(user, flag);
      cursor.div.style.display = 'none';
      cursor.nodeName.style.display = 'none';

      if (flag === myFlag && !nodeName) {
        return;
      }

      let div;
      if (nodeName) {
        div = cursor.nodeName;
        div.innerText = nodeName;
      } else {
        div = cursor.div;
        cursor.nodeName.innerText = '';
      }
      if (!xy) {
        return;
      }
      div.style.display = 'block';
      div.style.left = `${xy[0]}px`;
      div.style.top = `${xy[1]}px`;
    },
    dispatchMyPosition(xy, data) {
      const backup = helper.dispatchMyPosition;
      helper.dispatchMyPosition = () => { };
      setTimeout(() => (helper.dispatchMyPosition = backup), 100);

      dispatch({
        type: 'projectMessage/send',
        payload: xy ?
          `./cursor/update?x=${xy[0]}&y=${xy[1]}&node=${data.path}.${data.id}&flag=${myFlag}` :
          `./cursor/update?node=${data.path}.${data.id}&flag=${myFlag}`,
      });
    },
    updateMyPosition(xy, data) {
      xy && (onDrag.collide = { x: xy[0], y: xy[1], data });
      if (xy && onDrag.isDrag) {
        mark.style.left = `${xy[0] - 15}px`;
        mark.style.top = `${xy[1] - 15}px`;
        mark.style.display = 'block';
      } else {
        mark.style.display = 'none';
      }
      helper.dispatchMyPosition(xy, data);
    },
    onCommand: (who, what, when) => {
      const [path, data] = parseCommand(what);
      const handler = ({
        './cursor/update': () => helper.updateUserCursor(
          who,
          (data.x == null || data.y == null) ? null : [data.x, data.y],
          data.flag,
        ),
        './node/drag': () => helper.updateUserCursor(
          who,
          (data.x == null || data.y == null) ? null : [data.x, data.y],
          data.flag,
          data.nodeName,
        ),
      })[path];
      handler && handler();
    },
    onDrag: d3.drag().on('drag', onDrag).on('start', onDrag.start).on('end', onDrag.end),
  };
  return helper;
})();

class Mindmap extends React.Component {
  static defaultProps = {
    offset: [100, 0],
    space: 100,
    duration: 500,
  }
  componentDidMount() {
    let keydown = null;
    addEventListener('keydown', e => (keydown = e.keyCode));  // eslint-disable-line no-undef
    addEventListener('keyup', e => keydown === e.keyCode && (keydown = null));  // eslint-disable-line no-undef
    document.querySelector('#d3container')  // eslint-disable-line no-undef
      .addEventListener('contextmenu', (e) => {
        if (keydown !== 16) {
          e.stopPropagation();
          e.preventDefault();
        }
        keydown = null;
      });
    const { dispatch } = this.props;
    const contextMenu = {};
    ReactDom.render(
      <div>
        <Popover content={<div>
          <input ref={(input) => {
            input.value = contextMenu.inputValue;
            input.focus();
            contextMenu.input = input;

            input.onkeypress = (e) => {
              if (e.keyCode !== 13) {
                return;
              }
              e.stopPropagation();
              e.preventDefault();

              const value = input.value.trim().replace('.', '_');
              if (!value || !contextMenu.onInputSubmit) {
                return;
              }
              this.contextInput();
              contextMenu.onInputSubmit(value);
              contextMenu.onInputSubmit = null;
            };
          }} id="contextInput" />
        </div>} trigger="click">
          <a style={{ position: 'absolute' }} ref={(a) => {
            this.contextInput = (xy, value, resolve) => {
              if (xy) {
                a.style.setProperty('left', `${xy[0]}px`);
                a.style.setProperty('top', `${xy[1]}px`);
                contextMenu.inputValue = value;
                contextMenu.onInputSubmit = resolve;
              }
              a.click();
              if (contextMenu.input) {
                contextMenu.input.value = contextMenu.inputValue;
                setTimeout(() => contextMenu.input.focus(), 100);
              }
            };
          }} > </a>
        </Popover>
        <Popover content={<div>
          <p><a onClick={() => {
            const { xy, data } = contextMenu;
            this.contextMenu();
            this.contextInput(xy, `${data.id}_${data.children ? data.children.length : 0}`, (value) => {
              contextMenu.onInputSubmit = null;
              dispatch({
                type: 'projectMessage/send',
                payload: `/node/add?name=${value}&path=${data.path}.${data.id}`,
              });
            });
          }}><Icon type="plus" /> 添加子节点</a></p>
          <p><a onClick={() => {
            const { xy, data } = contextMenu;
            this.contextMenu();
            this.contextInput(xy, data.name || data.id, (value) => {
              contextMenu.onInputSubmit = null;
              dispatch({
                type: 'projectMessage/send',
                payload: `/node/edit?name=${value}&path=${data.path}.${data.id}`,
              });
            });
          }}><Icon type="edit" /> 重命名</a></p>
          <p><a onClick={() => {
            this.contextMenu();
            dispatch({
              type: 'projectMessage/send',
              payload: `/node/delete?name=${contextMenu.data.id}&path=${contextMenu.data.path}`,
            });
          }}><Icon type="delete" /> 删除</a></p>
        </div>} title="编辑节点" trigger="click">
          <a style={{ position: 'absolute' }} ref={(a) => {
            this.contextMenu = (xy, data) => {
              if (xy) {
                contextMenu.xy = xy;
                contextMenu.data = data;
                a.style.setProperty('left', `${xy[0]}px`);
                a.style.setProperty('top', `${xy[1]}px`);
              }
              a.click();
            };
          }} > </a>
        </Popover>
      </div>,
      document.querySelector('#contextMenu'),  // eslint-disable-line no-undef
    );

    const width = 1000;
    const height = 500;
    this.svg = d3.select('#d3container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g');
    this.treemap = d3.tree().size([height, width]);

    // 辅助面板
    helper.init(dispatch);
  }
  componentWillReceiveProps({
    projectDetail,
    projectMessage,
  }) {
    this.root || (projectDetail.name && this.dataManager.set({ id: projectDetail.name, path: '' }));
    projectMessage && this.dataManager.from(projectMessage.commands);
  }
  componentWillUnmount() {
    d3.select('#d3container>svg').remove();
  }
  dataManager = {
    commandIndex: 0,
    // 解析命令集，处理同步问题
    from: (commands) => {
      let commandIndex = this.dataManager.commandIndex;
      const newCommands = commands.slice(commandIndex)
        .sort((l, r) => l.send_time > r.send_time);
      if (!newCommands.length) {
        return;
      }
      if (commandIndex > 0 && newCommands[0].send_time < commands[commandIndex - 1].send_time) {
        console.warn('时间乱序，开始重排');
        this.dataManager.commandIndex = 0;
        this.dataManager.set({ id: this.root.data.id, path: '' });
        return this.dataManager.from(commands);
      }
      newCommands.forEach((command) => {
        commandIndex += 1;
        const [path, query] = parseCommand(command.content);
        const handler = ({
          '/node/add': (data) => {
            if (!data.name || !data.path) {
              throw new Error('缺少节点参数');
            }
            this.dataManager.add(data.name, data.path);
          },
          '/node/delete': (data) => {
            if (!data.name) {
              throw new Error('缺少节点参数');
            }
            if (!data.path) {
              throw new Error('根节点不可删除');
            }
            this.dataManager.delete(data.name, data.path);
          },
          '/node/edit': (data) => {
            if (!data.name || !data.path) {
              throw new Error('缺少节点参数');
            }
            this.dataManager.edit(data.name, data.path);
          },
          '/node/move': (data) => {
            if (!data.name || !data.from || !data.to) {
              throw new Error('缺少节点参数');
            }
            this.dataManager.move(data.name, data.from, data.to);
          },
        })[path];
        if (handler) {
          try {
            handler(query);
          } catch (error) {
            if (commands.length - commandIndex < 6) {
              Message.error(`${error.message}, from ${command.sender.name} [${command.send_time}]`, 3);
            }
            console.warn(error.message, command);
          }
        } else {
          console.warn('未知命令', command);
        }
      });
      this.dataManager.commandIndex = commandIndex;
    },
    set: (data) => {
      this.dataManager.commandIndex = 0;
      this.root = { data };
      this.dataManager.update();
    },
    add: (name, path) => {
      const node = this.dataManager.find(path);
      if (!node.children) {
        node.children = [];
      } else if (node.children.some(data => (data.id === name))) {
        throw new Error('兄弟节点id冲突');
      }
      node.children.push({ id: name, path });
      this.dataManager.update();
    },
    delete: (name, path) => {
      const node = this.dataManager.find(path);
      node.children = node.children.filter(data => data.id !== name);
      this.dataManager.update();
    },
    edit: (name, path) => {
      this.dataManager.find(path).name = name;
      this.dataManager.update();
    },
    move: (name, from, to) => {
      const fromNode = this.dataManager.find(from);
      const toNode = this.dataManager.find(to);
      const node = this.dataManager.find(name, fromNode);
      if (!fromNode || !toNode || !node) {
        throw new Error('无效的节点路径');
      }

      if (!toNode.children) {
        toNode.children = [];
      } else if (toNode.children.some(data => (data.id === name))) {
        throw new Error('兄弟节点id冲突');
      }
      toNode.children.push(node);
      fromNode.children = fromNode.children.filter(data => data.id !== name);

      this.dataManager.update();
    },
    find: (path, parent = null) => {
      let cursor = parent || { children: [this.root.data] };
      if (!path.split('.').every((id) => {
        if (!id) {
          return true;
        }
        if (!cursor.children) {
          return false;
        }
        cursor = cursor.children.find(data => data.id === id);
        return cursor != null;
      })) {
        throw new Error('无效的节点路径');
      }
      return cursor;
    },
    update: () => {
      this.root = d3.hierarchy(this.root.data, d => d.children);
      this.draw(this.root);
    },
  }
  i = 0;
  draw = (source) => {
    /* eslint-disable no-param-reassign */
    /* eslint-disable no-underscore-dangle */

    const { svg, treemap, root, props: { offset, space, duration } } = this;
    const treeData = treemap(root);

    {
      const nodes = treeData.descendants();
      nodes.forEach((d) => { d.y = offset[0] + (d.depth * space); });
      const node = svg.selectAll('g.node').data(nodes, d => d.data.id);

      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${source.y0 || source.y}, ${source.x0 || source.x})`)
        .on('click', (d) => {
          [d.children, d._children] = [d._children, d.children];
          this.draw(d);
        })
        .on('contextmenu', (d) => {
          this.contextMenu(
            // d.attr('transform').match(/^translate\(([\d.]*),\s?([\d.]*)\)$/).slice(1, 3),
            [d.y, d.x],
            d.data,
          );
        })
        .on('mouseenter', d => helper.updateMyPosition([d.y, d.x], d.data))
        .on('mouseleave', d => helper.updateMyPosition(null, d.data))
        .call(helper.onDrag);
      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'));
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', d => (d.children ? -13 : 13))
        .attr('text-anchor', d => (d.children ? 'end' : 'start'))
        .text(d => d.data.name || d.data.id);

      const nodeUpdate = nodeEnter.merge(node).transition()
        .duration(duration)
        .attr('transform', d => `translate(${d.y}, ${d.x})`);
      nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
        .attr('cursor', 'pointer');
      nodeUpdate.select('text').text(d => d.data.name || d.data.id);

      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', () => `translate(${source.y}, ${source.x})`)
        .remove();
      nodeExit.select('circle').attr('r', 1e-6);
      nodeExit.select('text').style('fill-opacity', 1e-6);

      // 缓存节点位置，以便平滑过渡
      nodes.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });
    }

    {
      // 计算对角线
      const diagonal = (s, d) => {
        s.x = s.x || 0;
        s.y = s.y || 0;
        d.x = d.x || 0;
        d.y = d.y || 0;
        return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
      };
      const links = treeData.descendants().slice(1);
      const link = svg.selectAll('path.link').data(links, d => d.data.id);

      link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        })
        .merge(link)
        .transition()
        .duration(duration)
        .attr('d', d => diagonal(d, d.parent));

      link.exit().transition()
        .duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();
    }

    /* eslint-enable no-param-reassign */
    /* eslint-enable no-underscore-dangle */
  }
  render() {
    return (<div id="d3container">
      <style type="text/css" children={  // eslint-disable-line react/no-children-prop
        `
        .node circle {
          cursor: pointer;
          fill: #fff;
          stroke: steelblue;
          stroke-width: 1.5px;
        }
        .node text {
          font-size: 11px;
        }
        path.link {
          fill: none;
          stroke: #ccc;
          stroke-width: 1.5px;
        }
        `
      } />
      <div id="contextMenu"></div>
      <div id="helperPanel"></div>
    </div>);
  }
}

import { connect } from 'dva';
export default connect(({ projectDetail, projectMessage }) =>
  ({ projectDetail, projectMessage }))(Mindmap);