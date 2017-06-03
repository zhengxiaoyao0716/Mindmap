// / <reference path="./../../typings/index.d.ts" />
import React from 'react';
import ReactDom from 'react-dom';
import { Popover, Icon, message as Message } from 'antd';
import * as d3 from 'd3';

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
              payload: `/node/cut?name=${contextMenu.data.id}&path=${contextMenu.data.path}`,
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
  }
  componentWillReceiveProps({ projectDetail: { name }, projectMessage: { commands } }) {
    this.root || this.dataManager.set({ id: name, path: '' });
    this.dataManager.from(commands);
  }
  componentWillUnmount() {
    d3.select('#d3container>svg').remove();
  }
  dataManager = {
    commandIndex: 0,
    from: (commands) => {
      commands.slice(this.dataManager.commandIndex).every((command) => {
        this.dataManager.commandIndex += 1;
        const [path, query = ''] = command.content.split('?');
        const handler = ({
          '/node/add': (data) => {
            if (!data.name || !data.path) {
              throw new Error('缺少节点参数');
            }
            this.dataManager.add(data.name, data.path);
          },
          '/node/cut': (data) => {
            if (!data.name) {
              throw new Error('缺少节点参数');
            }
            if (!data.path) {
              throw new Error('根节点不可删除');
            }
            this.dataManager.cut(data.name, data.path);
          },
          '/node/edit': (data) => {
            if (!data.name || !data.path) {
              throw new Error('缺少节点参数');
            }
            this.dataManager.edit(data.name, data.path);
          },
        })[path];
        if (handler) {
          const data = {};
          query.split('&').forEach((kv) => {
            if (!kv) {
              return;
            }
            const [k, v] = kv.split('=');
            data[k] = v;
          });
          try {
            handler(data);
          } catch (error) {
            if (commands.length - this.dataManager.commandIndex < 6) {
              Message.error(`${error.message}, from ${command.sender.name} [${command.send_time}]`, 3);
            }
            console.warn(error.message, command);
          }
        } else {
          console.warn('未知命令', command);
        }
        return true;
      });
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
    cut: (name, path) => {
      const node = this.dataManager.find(path);
      node.children = node.children.filter(data => data.id !== name);
      this.dataManager.update();
    },
    edit: (name, path) => {
      this.dataManager.find(path).name = name;
      this.dataManager.update();
    },
    find: (path) => {
      let cursor = { children: [this.root.data] };
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
        });
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
        .attr('d', (d) => {
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
    </div>);
  }
}

import { connect } from 'dva';
export default connect(({ projectDetail, projectMessage }) =>
  ({ projectDetail, projectMessage }))(Mindmap);
