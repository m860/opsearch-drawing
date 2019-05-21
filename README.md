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

设置链接线的样式通过设置`option.attrs`进行设置.`option.attrs`支持标准的`svg`属性,可以根据需要再进行其他设置

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

## 如何设置箭头链接线的大小?

设置箭头链接线的大小需要设置`option.distance`,即箭头的长度,长度越长箭头越大,越短越小

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

## 如何给link绘制多个文本

`ArrowLinkDrawing`和`LinkDrawing`的`label`只支持一个文本,如果需要使用多个文本,则不能使用`label`的方式.使用`LinkTextDrawing`进行实现.

`LinkTextDrawing`的位置是基于Link的中心点来定位的,如果需要修改位置,请修改`dx`,`dy`进行调整.

<span style="color:red;font-weight:bold">注意:LinkTextDrawing只有当link初始化好之后(即当Link产生了ID之后)才能进行绘制,否则会报错,在添加的时候一定添加在Link实例之后</span>

```
[
  {
    "type": "draw",
    "params": [
      {
        "type": "CircleDrawing",
        "option": {
          "id": "6f2b983b-8196-f600-5fb9-7710b358ee58",
          "attrs": {
            "cx": 197,
            "cy": 82
          },
          "text": ""
        }
      }
    ]
  },
  {
    "type": "draw",
    "params": [
      {
        "type": "CircleDrawing",
        "option": {
          "id": "3d4d512f-7957-043a-fce0-770b9aa7ff45",
          "attrs": {
            "cx": 57,
            "cy": 82
          },
          "text": ""
        }
      }
    ]
  },
  {
    "type": "draw",
    "params": [
      {
        "type": "ArrowLinkDrawing",
        "option": {
          "id": "77634e02-e8fd-c9f3-fbb6-a2ebbb8d9688",
          "sourceId": "6f2b983b-8196-f600-5fb9-7710b358ee58",
          "targetId": "3d4d512f-7957-043a-fce0-770b9aa7ff45",
          "distance": 5
        }
      }
    ]
  },
  {
    "type": "draw",
    "params": [
      {
        "type": "LinkTextDrawing",
        "option": {
          "linkID": "77634e02-e8fd-c9f3-fbb6-a2ebbb8d9688",
          "text": "abc",
          "attrs": {
            "font-size": 12,
            "fill": "red",
            "stroke": "red"
          }
        }
      }
    ]
  },
  {
    "type": "draw",
    "params": [
      {
        "type": "LinkTextDrawing",
        "option": {
          "linkID": "77634e02-e8fd-c9f3-fbb6-a2ebbb8d9688",
          "text": "def",
          "attrs": {
            "font-size": 12,
            "fill": "black",
            "stroke": "black",
            "dx": 0,
            "dy": 10
          }
        }
      }
    ]
  }
]
```

