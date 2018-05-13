/**
 * Created by jean.h.ma on 26/04/2018.
 */
import {fromDrawing, actionTypeEnums, fromActions} from '../src/components/D3Graph'
import drawData from './drawing-data'

test('fromDrawing', () => {
    const drawingOption = {
        type: "LineDrawing", option: {id: "line1", attrs: {x1: 0, y1: 0, x2: 100, y2: 100}}
    }
    const ins = fromDrawing(drawingOption);
    expect(ins.constructor.name).toBe("LineDrawing")
})

test('fromActions', () => {
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
    }, {
        type: "draw",
        params: [{
            type: "PathDrawing",//绘制path,阴影也使用此Drawing
            option: {
                id: "path1",
                d: [{x: 0, y: 0}, {x: 80, y: 80}, {x: 120, y: 90}]
            }
        }]
    }, {
        type: "delete",//删除
        params: [
            "line1",// 参数是对应图形的ID
            {
                nextInterval: 1 //有时候需要快速执行下一个操作,可以设置nextInterval=1,保证操作的连续性
            }
        ]
    }, {
        type: "draw",
        params: [{
            type: "TextCircleDrawing",
            option: {
                id: "text-circle-1",
                circleAttrs: {
                    cx: 13,
                    cy: 5
                }
            }
        }]
    }];
    const ins = fromActions(actions);
    expect(ins.length).toBe(actions.length);
    expect(ins[0].constructor.name).toBe("DrawAction");
    expect(ins[3].constructor.name).toBe("DeleteAction");
    expect(ins[3].params).toBe(actions[3].params[0]);
    expect(ins[3].nextInterval).toBe(1);
    console.log(ins);
})

test('fromActions from drawing-data.json', () => {
    const options = drawData.step.data;
    const actions = fromActions(options)
    expect(options.length).toBe(actions.length);
})