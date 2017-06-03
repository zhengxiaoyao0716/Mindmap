// / <reference path="./../../typings/index.d.ts" />
import React from 'react';
import * as d3 from 'd3';

class Mindmap extends React.Component {
  static defaultProps = {
    offset: [100, 0],
    space: 100,
    duration: 500,
  }
  componentDidMount() {
    const width = 1000;
    const height = 500;
    this.svg = d3.select('#d3container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g');
    this.treemap = d3.tree().size([height, width]);
    this.dataManager.from(this.props.projectMessage.commands);
  }
  componentWillReceiveProps({ projectMessage: { commands } }) {
    this.dataManager.from(commands);
  }
  componentWillUnmount() {
    d3.select('#d3container>svg').remove();
  }
  dataManager = {
    from: (() => {
      let index = 0;
      return (commands) => {
        commands.slice(index).every((command) => {
          index += 1;
          const [path, query = ''] = command.content.split('?');
          const handler = ({
            '/node/add': (data) => {
              if (!data.name) {
                return '缺少节点名';
              }
              return this.dataManager.add(data.name, data.path);
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
            console.log(data);
            const error = handler(data);
            console.warn(error, command);
          } else {
            console.warn('未知命令', command);
          }
          return true;
        });
      };
    })(),
    set: (data) => {
      this.root = d3.hierarchy(data, d => d.children);
      this.draw(this.root);
    },
    add: (name, path = '') => {
      const newData = { id: name, name };
      if (this.root) {
        let cursor = { children: [this.root.data] };
        if (!path.split('.').every((id) => {
          if (!cursor.children) {
            return false;
          }
          cursor = cursor.children.find(d => d.id === id);
          return cursor != null;
        })) {
          return '无效的节点路径';
        }
        console.log(cursor);
        if (!cursor.children) {
          cursor.children = [];
        }
        cursor.children.push(newData);
      } else {
        this.root = { data: newData };
      }

      this.root = d3.hierarchy(this.root.data, d => d.children);
      this.draw(this.root);
    },
  }
  draw = (source) => {
    /* eslint-disable no-param-reassign */
    /* eslint-disable no-underscore-dangle */

    const { svg, treemap, root, props: { offset, space, duration } } = this;
    const treeData = treemap(root);

    const nodes = treeData.descendants();
    nodes.forEach((d) => { d.y = offset[0] + (d.depth * space); });
    const node = svg.selectAll('g.node').data(nodes, d => d.id);

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.y0 || source.y},${source.x0 || source.x})`)
      .on('click', (d) => {
        [d.children, d._children] = [d._children, d.children];
        this.draw(d);
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

    nodeEnter.merge(node).transition()
      .duration(duration)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .select('circle.node')
      .attr('r', 10)
      .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
      .attr('cursor', 'pointer');

    const nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', () => `translate(${source.y},${source.x})`)
      .remove();
    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text').style('fill-opacity', 1e-6);


    const links = treeData.descendants().slice(1);
    const link = svg.selectAll('path.link').data(links, (d) => { return d.id; });

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

    // 计算对角线
    function diagonal(s, d) {
      s.x = s.x || 0;
      s.y = s.y || 0;
      d.x = d.x || 0;
      d.y = d.y || 0;
      return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
    }
    // 缓存节点位置，以便平滑过渡
    nodes.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });

    /* eslint-enable no-param-reassign */
    /* eslint-enable no-underscore-dangle */
  }
  render() {
    return (<div id="d3container">
      <style type="text/css" children={`
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
        }`} />
    </div>);
  }
}

import { connect } from 'dva';
export default connect(({ projectDetail, projectMessage }) =>
  ({ projectDetail, projectMessage }))(Mindmap);
