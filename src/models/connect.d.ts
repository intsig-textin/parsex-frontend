import { ICommonModelState } from './common';
import { IUserModelState } from './user';
import { IContactFormModelState } from './contactForm';
import { IRobotModelState } from './robot';
import type { IScannerRobotState } from '@/pages/DashboardCommon/RobotScanner/model';
import type { ITextRobotState } from '@/pages/DashboardCommon/RobotText/model';
import type { ITextOldRobotState } from '@/pages/DashboardCommon/RobotOldText/model';
import { ITableRobotModelState } from '@/pages/DashboardCommon/RobotTable/model';
import type { ICertRobotState } from '@/pages/DashboardCommon/RobotCert/model';
import { IStructRobotModelState } from '@/pages/DashboardCommon/RobotStruct/model';

export { IUserModelState };
export { IContactFormModelState };
export { ICommonModelState };
export { IRobotModelState };
export { ITableRobotModelState };
export { IStructRobotModelState };

export interface ConnectState {
  Common: ICommonModelState;
  User: IUserModelState;
  ContactForm: IContactFormModelState;
  Robot: IRobotModelState;
  ScannerRobot: IScannerRobotState;
  TextRobot: ITextRobotState;
  TextOldRobot: ITextOldRobotState;
  CertRobot: ICertRobotState;
  TableRobot: ITableRobotModelState;
  StructRobot: IStructRobotModelState;
}
