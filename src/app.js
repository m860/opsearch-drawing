import './sass/index.sass'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InteractionTable from './components/InteractionTable'
import D3Graph, {
    ReDrawAction,
    DrawAction,
    LineDrawing,
    CircleDrawing,
    LinkDrawing,
    ArrowLinkDrawing,
    DotDrawing,
    NumberScaleDrawing,
    PathDrawing,
    graphModeEnum,
    TextDrawing,
    RectDrawing,
    LineToolbar,
    CircleToolbar,
    fromActions,
    DeleteAction,
    Toolbar,
    TextToolbar,
    ClearAction,
    NoneToolbar,
    LinkToolbar,
    ArrowLinkToolbar,
    TextCircleDrawing,
    InputAction,
    TextCircleToolbar,
    MoveToolbar, MoveAction, ActionTypeEnums,
    DrawingToolbar
} from './components/D3Graph'
import {set as setPath, get as getPath} from 'object-path'
import guid from 'guid'
import * as d3 from 'd3'
import data from '../test/drawing-data'
import update from 'immutability-helper'
import UserInput from "./components/UserInput";

LineDrawing.selectedAttrs = {
    stroke: "blue"
};

console.log(JSON.stringify(new ReDrawAction("sdf", {label: 1})))

class Example extends Component {
    constructor(props) {
        super(props);
        this.graph = null;
        this.numberScaleId = "number-scale";
        this.state = {
            interval: 1,
            actions: [],
            scale: 1,
            original: {
                x: 0,
                y: 0
            },
            coordinateType: "screen",
            actionJson: "",
            selectMode: "single",
            attrs: {
                width: 400,
                height: 300,
                viewBox: "0 0 400 300",
                style: {
                    backgroundColor: "#cccccc"
                }
            },
            drawingData: null,
            manualActionText: "",
            showTextCircleTool: true,
        };
    }

    randomX() {
        const fn = this.state.coordinateType === "screen" ?
            d3.randomUniform(20, 280) :
            d3.randomUniform(0, 10);
        return Math.floor(fn())
    }

    randomY() {
        const fn = this.state.coordinateType === "screen" ?
            d3.randomUniform(20, 280) :
            d3.randomUniform(0, 10);
        return Math.floor(fn());
    }

    exec() {
        try {
            const actions = fromActions(JSON.parse(this.state.actionJson));
            console.log(actions);
            this.setState({
                actions: actions,
                manualActionText: JSON.stringify(actions.map(item => {
                    if (item.params.toData) {
                        let state = item.params.toData().option;
                        delete state.id;
                        return {
                            type: "redraw",
                            params: [item.params.id, state]
                        };
                    }
                    return {};
                }))
            })
        }
        catch (ex) {
            throw ex;
        }
    }

    render() {
        return (
            <div>
                <div>
                    <label>画布设置</label><br/>
                    <textarea defaultValue={JSON.stringify(this.state.attrs)} onChange={({target: {value}}) => {
                        try {
                            const attrs = JSON.parse(value);
                            this.setState({
                                attrs: attrs
                            })
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }} style={{width: "100%", height: 100}}>
                    </textarea>
                </div>
                <div>
                    <label>时间间隔</label>
                    <input type="text" value={this.state.interval} onChange={({target: {value}}) => {
                        const num = parseFloat(value);
                        this.setState({
                            interval: isNaN(num) ? 0 : num
                        });
                    }}/>
                </div>
                <div>
                    <label>选择模式</label>
                    <select value={this.state.selectMode} onChange={({target: {value}}) => {
                        this.setState({
                            selectMode: value
                        })
                    }}>
                        <option value="single">single</option>
                        <option value="multiple">multiple</option>
                    </select>
                </div>

                <div>
                    <label>刻度尺</label>
                    <input type="text" value={this.state.scale} onChange={({target: {value}}) => {
                        const num = parseFloat(value);
                        this.setState({
                            scale: isNaN(num) ? 0 : num
                        });
                    }}/>
                </div>
                <div>
                    <label>坐标原点</label>
                    x:<input type="text" value={this.state.original.x} onChange={({target: {value}}) => {
                    const num = parseFloat(value);
                    this.setState(
                        update(this.state, {
                            original: {
                                x: {$set: isNaN(num) ? 0 : num}
                            }
                        })
                    );
                }}/>
                    y:<input type="text" value={this.state.original.y} onChange={({target: {value}}) => {
                    const num = parseFloat(value);
                    this.setState(
                        update(this.state, {
                            original: {
                                y: {$set: isNaN(num) ? 0 : num}
                            }
                        })
                    );
                }}/>
                </div>
                <div>
                    <label>坐标系</label>
                    <select value={this.state.coordinateType} onChange={({target: {value}}) => {
                        let newState = {
                            coordinateType: value
                        };
                        if (value === "math") {
                            newState.original = {
                                x: 20,
                                y: 280
                            };
                            newState.scale = 10;
                        }
                        else {
                            newState.original = {
                                x: 0,
                                y: 0
                            };
                            newState.scale = 1;
                        }
                        this.setState(newState, () => {
                            if (value === "math") {
                                //show number scale
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "NumberScaleDrawing",
                                            option: new NumberScaleDrawing({
                                                id: this.numberScaleId,
                                                scale: newState.scale
                                            })
                                        }]
                                    }])
                                }, this.exec.bind(this));
                            }
                            else {
                                //remove number scale
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "delete",
                                        params: [this.numberScaleId]
                                    }])
                                }, this.exec.bind(this))
                            }
                        });
                    }}>
                        <option value="screen">screen</option>
                        <option value="math">math</option>
                    </select>
                </div>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <div style={{flex: 1}}>
                        <div>
                            <label>图形JSON数据</label><br/>
                            <textarea value={this.state.actionJson}
                                      onBlur={() => {
                                          this.exec();
                                      }}
                                      onChange={({target: {value}}) => {
                                          this.setState({
                                              actionJson: value
                                          })
                                      }}
                                      style={{width: "100%", height: 100}}></textarea>
                        </div>
                        <div style={{display: "flex", flexDirection: "row", flexWrap: "wrap", flex: "1 0 auto"}}>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "DotDrawing",
                                            option: {
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画点
                            </button>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画圈
                            </button>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "LineDrawing",
                                            option: {
                                                attrs: {
                                                    x1: this.randomX(),
                                                    y1: this.randomY(),
                                                    x2: this.randomX(),
                                                    y2: this.randomY()
                                                }
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画线
                            </button>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "TextCircleDrawing",
                                            option: {
                                                text: "A",
                                                circleAttrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画带圈的文本
                            </button>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "PathDrawing",
                                            option: {
                                                d: [
                                                    {x: this.randomX(), y: this.randomY()},
                                                    {x: this.randomX(), y: this.randomY()},
                                                    {x: this.randomX(), y: this.randomY()},
                                                ]
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画多边形(三角形)
                            </button>
                            <button type="button" onClick={() => {
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "input",
                                        params: [[
                                            {label: "x", fieldName: "attrs.cx"},
                                            {label: "y", fieldName: "attrs.cy"},
                                        ]]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "DotDrawing"
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>画指定点
                            </button>
                            <button type="button" onClick={() => {
                                const sourceId = guid.raw();
                                const targetId = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: sourceId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: targetId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "LinkDrawing",
                                            option: {
                                                sourceId: sourceId,
                                                targetId: targetId
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>链接图形(link)
                            </button>
                            <button type="button" onClick={() => {
                                const sourceId = guid.raw();
                                const targetId = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: sourceId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: targetId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "LinkDrawing",
                                            option: {
                                                sourceId: sourceId,
                                                targetId: targetId,
                                                label: "hello"
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>链接图形(link),label=hello
                            </button>
                            <button type="button" onClick={() => {
                                const sourceId = guid.raw();
                                const targetId = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: sourceId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: targetId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "ArrowLinkDrawing",
                                            option: {
                                                sourceId: sourceId,
                                                targetId: targetId
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>链接图形(arrow-link)
                            </button>
                            <button type="button" onClick={() => {
                                const sourceId = guid.raw();
                                const targetId = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: sourceId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "CircleDrawing",
                                            option: {
                                                id: targetId,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "draw",
                                        params: [{
                                            type: "ArrowLinkDrawing",
                                            option: {
                                                sourceId: sourceId,
                                                targetId: targetId,
                                                label: "abc"
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>链接图形(arrow-link),label=abc
                            </button>
                            <button type="button" onClick={() => {
                                const id = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "DotDrawing",
                                            option: {
                                                id: id,
                                                attrs: {
                                                    cx: this.randomX(),
                                                    cy: this.randomY()
                                                }
                                            }
                                        }]
                                    }, {
                                        type: "select",
                                        params: [id]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机画一个点,并选中它
                            </button>
                            <button type="button" onClick={() => {
                                const id = guid.raw();
                                this.setState({
                                    actionJson: JSON.stringify([{
                                        type: "draw",
                                        params: [{
                                            type: "TextDrawing",
                                            option: {
                                                id: id,
                                                attrs: {
                                                    x: this.randomX(),
                                                    y: this.randomY(),
                                                },
                                                text:"Hello"
                                            }
                                        }]
                                    }])
                                }, this.exec.bind(this))
                            }}>随机绘制一个文本
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        this.setState({
                                            actionJson: JSON.stringify([{
                                                type: "clear"
                                            }])
                                        }, this.exec.bind(this))
                                    }}>clear(ClearAction)
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        if (this.graph) {
                                            this.graph.clear();
                                        }
                                    }}>clear(real clear)
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        this.setState({
                                            showTextCircleTool: !this.state.showTextCircleTool
                                        })
                                    }}>
                                隐藏/显示TextCircle Tool
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        const selected = this.graph.getSelectedShapes();
                                        if (selected.length > 0) {
                                            const first = selected[0];
                                            this.setState({
                                                actionJson: JSON.stringify([{
                                                    type: ActionTypeEnums.move,
                                                    params: [first.id, {
                                                        x: 10,
                                                        y: 10
                                                    }]
                                                }]),
                                            }, this.exec.bind(this));
                                        }
                                        else {
                                            alert("请选择一个图形")
                                        }
                                    }}>平移(10,10)
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        DrawingToolbar.handlers.setMoveHandler(this.graph);
                                    }}>切换为移动操作
                            </button>
                        </div>
                    </div>
                    <div style={{flex: 1}}>
                        <div>
                            <label>ReDrawAction</label><br/>
                            <textarea style={{width: "100%", height: 100}}
                                      value={this.state.manualActionText}
                                      onChange={({target: {value}}) => {
                                          this.setState({
                                              manualActionText: value
                                          })
                                      }}></textarea>
                        </div>
                        <div>
                            <button type="button" onClick={() => {
                                if (this.state.manualActionText) {
                                    try {
                                        const actions = JSON.parse(this.state.manualActionText);
                                        this.setState({
                                            actions: fromActions(actions),
                                        })
                                    }
                                    catch (ex) {
                                        console.log(ex)
                                    }
                                }
                            }}>执行
                            </button>
                        </div>
                    </div>
                </div>

                <D3Graph actions={this.state.actions}
                         ref={ref => this.graph = ref}
                         coordinateType={this.state.coordinateType}
                         renderToolbar={(graph) => {
                             let tools = [
                                 <NoneToolbar key={"none"} graph={graph}/>,
                                 <MoveToolbar key="move" graph={graph}/>,
                                 <CircleToolbar key={"circle"} graph={graph}/>,
                                 <LineToolbar key={"line"} graph={graph}/>,
                                 <LinkToolbar key={"link"} graph={graph}/>,
                                 <ArrowLinkToolbar key={"arrowLink"} graph={graph}/>
                             ];
                             if (this.state.showTextCircleTool) {
                                 tools.push(<TextCircleToolbar key={"textCircle"} graph={graph}/>)
                             }
                             return tools;
                         }}
                         onAction={action => {
                             console.log(action);
                         }}
                         original={this.state.original}
                         scale={this.state.scale}
                         attrs={this.state.attrs}
                         selectMode={this.state.selectMode}
                         interval={this.state.interval}/>
                <div>
                    <div>
                        <button type="button" onClick={() => {
                            const data = this.graph.getDrawingData();
                            this.setState({
                                drawingData: data
                            });
                        }}>显示图形数据
                        </button>
                    </div>
                    <div>{JSON.stringify(this.state.drawingData)}</div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <Example></Example>
    , document.getElementById("view"));