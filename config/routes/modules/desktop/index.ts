import { IRoute } from 'umi-types';

const DesktopRoutes: IRoute = {
  path: '/',
  component: '../layouts/RobotTableLayout',
  routes: [
    {
      path: 'robot_markdown',
      component: '@/pages/DashboardCommon/RobotMarkdown/index',
    },
    { path: '*', component: '@/components/404' },
  ],
};

export default DesktopRoutes;
