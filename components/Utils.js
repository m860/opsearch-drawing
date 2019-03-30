"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getArrowPath = getArrowPath;
function getArrowPath(startPoint, endPoint) {
    var distance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

    console.log(startPoint, endPoint);
    var diffX = startPoint.x - endPoint.x;
    var diffY = startPoint.y - endPoint.y;
    var a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    var ex = diffX / a;
    var ey = diffY / a;

    var q2x = endPoint.x + ex * distance;
    var q2y = endPoint.y + ey * distance;

    var fx = Math.cos(Math.PI / 2) * ex + Math.sin(Math.PI / 2) * ey;
    var fy = -Math.sin(Math.PI / 2) * ex + Math.cos(Math.PI / 2) * ey;
    var q1x = q2x + fx * distance * 0.5;
    var q1y = q2y + fy * distance * 0.5;

    var gx = Math.cos(-Math.PI / 2) * ex + Math.sin(-Math.PI / 2) * ey;
    var gy = -Math.sin(-Math.PI / 2) * ex + Math.cos(-Math.PI / 2) * ey;
    var q3x = q2x + gx * distance * 0.5;
    var q3y = q2y + gy * distance * 0.5;

    return [{ x: q2x, y: q2y }, { x: q1x, y: q1y }, { x: endPoint.x, y: endPoint.y }, { x: q3x, y: q3y }, { x: q2x, y: q2y }];
}