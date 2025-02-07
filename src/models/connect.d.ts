import { ICommonModelState } from './common';
import { IRobotModelState } from './robot';

export { ICommonModelState };
export { IRobotModelState };
export interface ConnectState {
  Common: ICommonModelState;
  Robot: IRobotModelState;
}
