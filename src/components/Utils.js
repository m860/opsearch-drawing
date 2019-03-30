export function getArrowPath(startPoint, endPoint, distance = 10) {
    console.log(startPoint,endPoint);
    const diffX = startPoint.x - endPoint.x;
    const diffY = startPoint.y - endPoint.y;
    const a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    const ex = diffX / a;
    const ey = diffY / a;

    const q2x = endPoint.x + ex * distance;
    const q2y = endPoint.y + ey * distance;

    const fx = Math.cos(Math.PI / 2) * ex + Math.sin(Math.PI / 2) * ey;
    const fy = -Math.sin(Math.PI / 2) * ex + Math.cos(Math.PI / 2) * ey;
    const q1x = q2x + fx * distance * 0.5;
    const q1y = q2y + fy * distance * 0.5;

    const gx = Math.cos(-Math.PI / 2) * ex + Math.sin(-Math.PI / 2) * ey;
    const gy = -Math.sin(-Math.PI / 2) * ex + Math.cos(-Math.PI / 2) * ey;
    const q3x = q2x + gx * distance * 0.5;
    const q3y = q2y + gy * distance * 0.5;

    return [
        {x: q2x, y: q2y},
        {x: q1x, y: q1y},
        {x: endPoint.x, y: endPoint.y},
        {x: q3x, y: q3y},
        {x: q2x, y: q2y}
    ]
}