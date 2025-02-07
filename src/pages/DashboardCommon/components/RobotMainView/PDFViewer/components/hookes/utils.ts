// 格式化旋转角度为逆时针角度
export function formatAngle(rotate?: number) {
  if (!rotate) return 0;
  let angle = Math.round((rotate % 360) / 90) * 90;
  if (angle > 0) {
    angle = angle - 360;
  }
  return angle;
}

// 获取旋转
export function getRotateInfo(angle: number, { width, height }: { width: number; height: number }) {
  const result = formatAngle(angle);
  switch (result) {
    case -90:
      return {
        translate: { x: 0, y: width },
        transform: { x: -width, y: 0 },
        rotate: -(90 * Math.PI) / 180,
        canvasSize: { width: height, height: width },
      };
    case -180:
      return {
        translate: { x: width, y: height },
        transform: { x: -width, y: -height },
        rotate: Math.PI,
        canvasSize: { width, height },
      };
    case -270:
      return {
        translate: { x: height, y: 0 },
        transform: { x: 0, y: -height },
        rotate: (90 * Math.PI) / 180,
        canvasSize: { width: height, height: width },
      };
    default:
      return {
        translate: { x: 0, y: 0 },
        transform: { x: 0, y: 0 },
        rotate: 0,
        canvasSize: { width, height },
      };
  }
}
