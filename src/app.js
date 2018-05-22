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

class TestDrawing extends Component {
    render() {
        return (
            <div>
                <h3>测试绘制,坐标系基于屏幕坐标系</h3>
                <D3Graph actions={[
                    new DrawAction(new DotDrawing({
                        attrs: {
                            cx: 50,
                            cy: 50
                        }
                    })),
                    new DrawAction(new LineDrawing({
                        attrs: {
                            x1: 20,
                            y1: 10,
                            x2: 100,
                            y2: 200
                        }
                    })),
                    new DrawAction(new CircleDrawing({
                        attrs: {
                            cx: 100,
                            cy: 100
                        }
                    })),
                    new DrawAction(new TextCircleDrawing({
                        text: "1",
                        circleAttrs: {
                            cx: 150,
                            cy: 150
                        }
                    })),
                    new DrawAction(new PathDrawing({
                        d: [{
                            x: 150,
                            y: 30
                        }, {
                            x: 180,
                            y: 70
                        }, {
                            x: 120,
                            y: 50
                        }]
                    }))
                ]}/>
            </div>
        )
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
    }

    componentDidMount() {
        this.playCustomAction();
    }

}

ReactDOM.render(
    <Example></Example>
    , document.getElementById("view"));