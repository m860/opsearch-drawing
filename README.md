# opserarch-drawing

运筹学图形

<!-- badge -->
[![npm version](https://img.shields.io/npm/v/@m860/opsearch-drawing.svg)](https://www.npmjs.com/package/@m860/opsearch-drawing)
[![npm license](https://img.shields.io/npm/l/@m860/opsearch-drawing.svg)](https://www.npmjs.com/package/@m860/opsearch-drawing)
[![npm download](https://img.shields.io/npm/dm/@m860/opsearch-drawing.svg)](https://www.npmjs.com/package/@m860/opsearch-drawing)
[![npm download](https://img.shields.io/npm/dt/@m860/opsearch-drawing.svg)](https://www.npmjs.com/package/@m860/opsearch-drawing)
<!-- endbadge -->

## action说明

### draw 绘制

### 反序列化

#### example

```javascript
//先引入`fromActions`
import {fromActions} from '../src/components/D3Graph'

const actions = [{
		type: "draw", //绘制action
		params: [{
			type: "LineDrawing",//画线
			option: {
				id: "line1",
				attrs: {
					x1: 0,
					y1: 0,
					x2: 100,
					y2: 100
				}
			}
		}]
	}, {
		type: "draw",//绘制action
		params: [{
			type: "DotDrawing",//画点
			option: {
				id: "dot1",
				attrs: {
					cx: 100,
					cy: 100
				}
			}
		}]
	}];
const ins = fromActions(actions);
```

## 通过代码切换画布的操作

```javascript
import React,{Component} from "react"
import D3Graph,{DrawingToolbar} from "@m860/opsearch-drawing"

export default class Test extends Component{
    constructor(props){
        super(props);
        this.graph=null;
    }
    render(){
        <D3Graph ref={ref=>this.graph=ref}></D3Graph>
    }
    componentDidMount(){
        //切换为移动操作
        DrawingToolbar.handlers.setMoveHandler(this.graph);
    }
}

```

## 如何设置链接线的样式

设置链接线的样式通过设置`options.attrs`进行设置.`option.attrs`支持标准的`svg`属性,可以根据需要再进行其他设置

如:设置链接线为红色的虚线

```
{
  "type": "draw",
  "params": [
    {
      "type": "ArrowLinkDrawing",
      "option": {
        "sourceId": "01a0c9e3-1ccc-96ae-20a6-abd9d76151c7",
        "targetId": "52ecb986-4ca1-7a0b-7384-f89f57b98979",
        "label": "abc",
        "attrs":{
            "fill":"red", //设置填充色为红色
            "stroke":"red"//设置边框色为红色
            "stroke-dasharray":"5,5" //设置为虚线样式
        }
      }
    }
  ]
}
```

## change logs

### next version

- [ ] 圆圈中的文本居中显示.目前在测试环境没有发现不居中的问题
- [x] 箭头链接线支持箭头大小的调整.大小可以通过`distance`来进行控制
```
{
  "type": "draw",
  "params": [
    {
      "type": "ArrowLinkDrawing",
      "option": {
        "sourceId": "01a0c9e3-1ccc-96ae-20a6-abd9d76151c7",
        "targetId": "52ecb986-4ca1-7a0b-7384-f89f57b98979",
        "label": "abc",
        "distance": 20   //设置箭头的大小为20,
        "attrs":{
            "fill":"red", //设置填充色为红色
            "stroke":"red"//设置边框色为红色,最终箭头链接线将成为红色
        }
      }
    }
  ]
}
```
- [ ] 链接线支持多文本编辑
- [ ] 链接线支持折点编辑
- [ ] 菱形标记待确认

### 0.0.4

- 优化了link的显示
- 修复了PathDrawing绘制的Bug
- 调整了刻度尺的显示问题
