import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { contractAddress } from 'config';
import { RouteNamesEnum } from 'localConstants';
import styles from './dashboard.styles';




export const Dashboard = () => {

  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (pathname === RouteNamesEnum.dashboard) {
      navigate(RouteNamesEnum.dashboardOverview);
    }
  }, [pathname, navigate]);

  return (
    <div className={styles.dashboardContainer}>


      <div
        style={{ backgroundImage: 'url(/background.svg)' }}
        className={styles.dashboardContent}
      >
        <Outlet />
      </div>
    </div>
  );
};
