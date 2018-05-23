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
    InputAction
} from './components/D3Graph'
import {set as setPath, get as getPath} from 'object-path'
import guid from 'guid'
import * as d3 from 'd3'
import data from '../test/drawing-data'
import update from 'immutability-helper'

class TestDrawing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interval: 1,
            actions: [],
            scale: 1,
            original: {
                x: 0,
                y: 0
            },
            coordinateType: "screen",
            actionJson: "[\n" +
            "  {\"type\":\"draw\",\"params\":[{\"type\":\"CircleDrawing\",\"option\":{\"attrs\":{\"cx\":50,\"cy\":50}}}]}\n" +
            "]"
        };
    }

    get randomX() {
        return d3.randomUniform(20, 380);
    }

    get randomY() {
        return d3.randomUniform(20, 280);
    }

    drawing() {
        try {
            const actions = fromActions(JSON.parse(this.state.actionJson));
            this.setState({
                actions: actions
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
                    <label>时间间隔</label>
                    <input type="text" value={this.state.interval} onChange={({target: {value}}) => {
                        const num = parseFloat(value);
                        this.setState({
                            interval: isNaN(num) ? 0 : num
                        });
                    }}/>
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
                <div>
                    <label>图形JSON数据</label><br/>
                    <textarea value={this.state.actionJson} onChange={({target: {value}}) => {
                        this.setState({
                            actionJson: value
                        })
                    }} style={{width: "100%", height: 100}}></textarea>
                </div>
                <div>
                    <button type="button"
                            onClick={this.drawing.bind(this)}>Drawing
                    </button>
                </div>
                <D3Graph actions={this.state.actions}
                         interval={this.state.interval}/>
            </div>
        )
    }
}

class TestMathCoordinateDrawing extends Component {
    render() {
        const original = {
            x: 20,
            y: 280
        };
        const scale = 20;
        return (
            <div>
                <h3>测试数学坐标系的绘制</h3>
                <D3Graph actions={[
                    new DrawAction(new NumberScaleDrawing({
                        original,
                        scale
                    })),
                    new DrawAction(new CircleDrawing({
                        attrs: {
                            cx: 5,
                            cy: 5
                        }
                    })),
                    new DrawAction(new TextCircleDrawing({
                        text: "A",
                        circleAttrs: {
                            cx: 9,
                            cy: 5
                        }
                    }))
                ]}
                         original={original}
                         coordinateType="math"
                         scale={scale}/>
            </div>
        );
    }
}

class Example extends Component {
    constructor(props) {
        super(props);
        this.original = {
            x: 20,
            y: 280
        };
        this.state = {
            tableData: [],
            actions: [],
            mode: graphModeEnum.none,
            scale: 20
        };
    }

    draw() {
        this.setState({
            mode: graphModeEnum.draw,
            actions: [
                new DrawAction(new NumberScaleDrawing({
                    original: this.original,
                    xAxisLength: 360,
                    yAxisLength: 260
                })),
                new DrawAction(new DotDrawing({
                    attrs: {
                        cx: 15,
                        cy: 10
                    }
                })),
                new DrawAction(new LineDrawing({
                    id: "line1",
                    attrs: {
                        x1: 0,
                        y1: 1,
                        x2: 5,
                        y2: 5
                    }
                })),
                new DrawAction(new CircleDrawing({
                    id: "circle1",
                    attrs: {
                        cx: 4,
                        cy: 1
                    }
                })),
                new DrawAction(new CircleDrawing({
                    id: "circle2",
                    attrs: {
                        cx: 10,
                        cy: 1
                    }
                }), {
                    nextInterval: 1
                }),
                new DrawAction(new LinkDrawing({
                    sourceId: "circle1",
                    targetId: "circle2",
                    label: "abc"
                })),
                new DrawAction(new CircleDrawing({
                    id: "c3",
                    attrs: {
                        cx: 4,
                        cy: 7
                    }
                })),
                new DrawAction(new CircleDrawing({
                    id: "c4",
                    attrs: {
                        cx: 10,
                        cy: 7
                    }
                })),
                new DrawAction(new ArrowLinkDrawing({
                    sourceId: "c3",
                    targetId: "c4",
                    label: "def"
                }), {
                    nextInterval: 1
                }),
                // new DrawAction(new PathDrawing({
                // 	attrs: {
                // 		d: "M 100 100 L 150 100 L 130 80 Z"
                // 	}
                // })),
                new DrawAction(new TextDrawing({
                    attrs: {
                        x: 10,
                        y: 10
                    },
                    text: "hello text"
                })),
                // new DrawAction(new RectDrawing({
                // 	attrs: {
                // 		d: "M 80 80 L 120 80 L 120 120 L 80 120 Z"
                // 	}
                // })),
                // new DeleteAction("line1")
                new DrawAction(new TextCircleDrawing({
                    text: "abc",
                    circleAttrs: {
                        cx: 12,
                        cy: 3
                    }
                }))
            ]
        })
    }

    playDataActions() {
        const actions = fromActions(data.step.data);
        this.setState({
            mode: graphModeEnum.playing,
            actions: [
                new DrawAction(new NumberScaleDrawing({
                    original: this.original,
                    xAxisLength: 360,
                    yAxisLength: 260,
                    scale: this.state.scale
                })),
                ...actions
            ]
        });
    }

    playCustomAction() {
        this.setState({
            mode: graphModeEnum.playing,
            actions: [
                new DrawAction(new NumberScaleDrawing({
                    original: this.original,
                    xAxisLength: 360,
                    yAxisLength: 260
                })),
                // new DrawAction(new DotDrawing({
                //     attrs: {
                //         cx: 15,
                //         cy: 10
                //     }
                // })),
                // new DrawAction(new LineDrawing({
                //     id: "line1",
                //     attrs: {
                //         x1: 0,
                //         y1: 1,
                //         x2: 5,
                //         y2: 5
                //     }
                // })),
                // new DrawAction(new CircleDrawing({
                //     id: "circle1",
                //     attrs: {
                //         cx: 4,
                //         cy: 1
                //     }
                // })),
                // new DrawAction(new CircleDrawing({
                //     id: "circle2",
                //     attrs: {
                //         cx: 10,
                //         cy: 1
                //     }
                // }), {
                //     nextInterval: 1
                // }),
                // new DrawAction(new LinkDrawing({
                //     sourceId: "circle1",
                //     targetId: "circle2",
                //     label: "abc"
                // })),
                // new DrawAction(new CircleDrawing({
                //     id: "c3",
                //     attrs: {
                //         cx: 4,
                //         cy: 7
                //     }
                // })),
                // new DrawAction(new CircleDrawing({
                //     id: "c4",
                //     attrs: {
                //         cx: 10,
                //         cy: 7
                //     }
                // })),
                // new DrawAction(new ArrowLinkDrawing({
                //     sourceId: "c3",
                //     targetId: "c4",
                //     label: "def"
                // }), {
                //     nextInterval: 1
                // }),
                new InputAction([{
                    label: "x",
                    fieldName: "attrs.cx"
                }, {
                    label: "y",
                    fieldName: "attrs.cy"
                }]),
                new DrawAction(new DotDrawing()),
                new DrawAction(new TextDrawing({
                    attrs: {
                        x: 10,
                        y: 10
                    },
                    text: "hello text"
                })),
                new DrawAction(new TextCircleDrawing({
                    text: "abc",
                    circleAttrs: {
                        cx: 12,
                        cy: 3
                    }
                }))
            ]
        })
    }


    render() {
        return <TestDrawing/>;
        /*
        return (
            <div>
                <TestDrawing/>
                <div>
                    <h6>运筹学图形Example</h6>
                    <div>
                        <button type="button" onClick={this.playDataActions.bind(this)}>play</button>
                        <button type="button" onClick={this.draw.bind(this)}>draw</button>
                        <button type="button" onClick={this.playCustomAction.bind(this)}>play custom action</button>
                    </div>
                    <D3Graph
                        renderToolbar={(graph) => {
                            return (
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <NoneToolbar graph={graph}/>
                                    <LineToolbar graph={graph}/>
                                    <CircleToolbar graph={graph}/>
                                    <LinkToolbar graph={graph}/>
                                    <ArrowLinkToolbar graph={graph}/>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 40,
                                        height: 40,
                                        cursor: "pointer"
                                    }}
                                         onClick={() => {
                                             graph.doActions([
                                                 new ClearAction()
                                             ])
                                         }}>
                                        清除
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 40,
                                        height: 40,
                                        cursor: "pointer"
                                    }}
                                         onClick={() => {
                                             const selectedShapes = graph.getSelectedShapes();
                                             if (selectedShapes.length > 0) {
                                                 graph.doActions([
                                                     new DeleteAction(selectedShapes[0].id)
                                                 ])
                                             }
                                         }}>
                                        删除
                                    </div>
                                </div>
                            );
                        }}
                        scale={this.state.scale}
                        original={this.original}
                        coordinateType={"math"}
                        mode={this.state.mode}
                        actions={this.state.actions}/>
                    <InteractionTable tableOption={{
                        firstRow: {
                            renderCell: (text) => <span>{text}</span>,
                            cells: ['a', 'b', 'c']
                        },
                        firstColumn: {
                            renderCell: text => <span>{text}</span>,
                            cells: [1, 2, 3]
                        },
                        renderCell: (data, rowIndex, columnIndex) => {
                            return (
                                <input type="text"
                                       onChange={({target: {value}}) => {
                                           let newState = Object.assign({}, this.state);
                                           setPath(newState, `tableData.${rowIndex}.${columnIndex}`, value);
                                           this.setState(newState);
                                       }}
                                       defaultValue={getPath(this.state, `tableData.${rowIndex}.${columnIndex}`)}/>
                            );
                        },
                        cells: this.state.tableData
                    }}/>
                </div>
            </div>
        );
        */
    }

    componentDidMount() {
        this.playCustomAction();
    }

}

ReactDOM.render(
    <Example></Example>
    , document.getElementById("view"));