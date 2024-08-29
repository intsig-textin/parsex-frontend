import { IRoute } from 'umi-types';
const routes: IRoute[] = [
  {
    path: '/',
    component: '@/layouts/RobotTableLayout',
    routes: [
      {
        path: '/',
        redirect: '/robot_markdown',
      },
      {
        path: '/robot_markdown',
        component: '@/pages/DashboardCommon/RobotMarkdown/index',
      },
      { path: '*', component: '@/components/404' },
    ],
  },
];
export default routes;
