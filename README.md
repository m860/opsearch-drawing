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
