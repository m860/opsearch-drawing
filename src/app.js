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
    TextCircleToolbar
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
            manualActionText: ""
        };
    }

    randomX() {
        const fn = d3.randomUniform(20, 380);
        return Math.floor(fn())
    }

    randomY() {
        const fn = d3.randomUniform(20, 280);
        return Math.floor(fn());
    }

    exec() {
        try {
            const actions = fromActions(JSON.parse(this.state.actionJson));
            this.setState({
                actions: actions,
                manualActionText: JSON.stringify(actions.map(item => {
                    let state = item.params.toData().option;
                    delete state.id;
                    return {
                        type: "redraw",
                        params: [item.params.id, state]
                    };
                }))
            }, () => {
                this.setState({})
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
                        this.setState({
                            coordinateType: value
                        })
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
                                    }
                                }
                            }}>执行
                            </button>
                        </div>
                    </div>
                </div>

                <D3Graph actions={this.state.actions}
                         ref={ref => this.graph = ref}
                         renderToolbar={(graph) => {
                             return [
                                 <NoneToolbar key={"none"} graph={graph}/>,
                                 <CircleToolbar key={"circle"} graph={graph}/>,
                                 <LineToolbar key={"line"} graph={graph}/>,
                                 <LinkToolbar key={"link"} graph={graph}/>,
                                 <ArrowLinkToolbar key={"arrowLink"} graph={graph}/>,
                                 <TextCircleToolbar key={"textCircle"} graph={graph}/>,
                             ];
                         }}
                         onAction={action => {
                             console.log(action);
                         }}
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