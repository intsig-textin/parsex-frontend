import { useState } from 'react';
import { createContainer } from 'unstated-next';
const RobotLayoutStore = createContainer(() => {
  const [resultLoading, setResultLoading] = useState(false);
  return {
    resultLoading,
    setResultLoading,
  };
});
export { RobotLayoutStore };
