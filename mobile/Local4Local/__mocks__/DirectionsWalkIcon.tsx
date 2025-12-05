import React from 'react';

const MockDirectionsWalkIcon: React.FC<{ width: number; height: number; fill: string }> = ({
  width,
  height,
  fill,
}) => {
  return <svg width={width} height={height} fill={fill} />;
};

export default MockDirectionsWalkIcon;