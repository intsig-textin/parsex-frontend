import { memo } from 'react';

const textStyle = {
  fontSize: 12,
  fill: '#ffffff',
};

interface IProps {
  points: number[];
  num: number;
}

export default memo<IProps>(({ points, num }) => {
  return (
    <>
      <rect x={points[0]} y={points[1]} width="16" fill="#4877FF" height="16" />
      <text
        x={points[0] + 8}
        y={points[1] + 8}
        alignmentBaseline="middle"
        textAnchor="middle"
        style={textStyle}
      >
        {num}
      </text>
    </>
  );
});
