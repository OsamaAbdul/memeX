import { RouteNamesEnum } from 'localConstants';
import { Dashboard } from 'pages/Dashboard/Dashboard';
import { Disclaimer } from 'pages/Disclaimer/Disclaimer';
import { Home } from 'pages/Home/Home';
import { Unlock } from 'pages/Unlock/Unlock';
import { RouteType } from 'types';

import { Overview } from 'pages/Dashboard/Overview';
import { CreateToken } from 'pages/CreateToken/CreateToken';
import { TokenDetails } from 'pages/TokenDetails/TokenDetails';

interface RouteWithTitleType extends RouteType {
  title: string;
  authenticatedRoute?: boolean;
  children?: RouteWithTitleType[];
}

export const routes: RouteWithTitleType[] = [
  {
    path: RouteNamesEnum.home,
    title: 'Home',
    component: Home
  },
  {
    path: RouteNamesEnum.unlock,
    title: 'Unlock',
    component: Unlock
  },
  {
    path: RouteNamesEnum.dashboard,
    title: 'Dashboard',
    component: Dashboard,
    authenticatedRoute: true,
    children: [
      {
        path: RouteNamesEnum.dashboardOverview,
        title: 'Overview',
        component: Overview
      },
      {
        path: RouteNamesEnum.dashboardCreate,
        title: 'Create Token',
        component: CreateToken
      },
      {
        path: RouteNamesEnum.dashboardTokenDetails,
        title: 'Token Details',
        component: TokenDetails
      },
      {
        path: RouteNamesEnum.dashboardProfile,
        title: 'Profile',
        component: Overview // Placeholder
      }
    ]
  },
  {
    path: RouteNamesEnum.disclaimer,
    title: 'Disclaimer',
    component: Disclaimer
  }
];
