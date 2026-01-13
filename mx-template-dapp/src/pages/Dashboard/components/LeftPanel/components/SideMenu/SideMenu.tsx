import {
  faChartLine,
  faChevronUp,
  faGem,
  faPalette,
  faRocket,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from 'localConstants';
import { ItemIcon } from './components';
import styles from './sideMenu.styles';
import { MenuItemsType, SideMenuPropsType } from './sideMenu.types';

const menuItems = [
  {
    title: 'Overview',
    icon: faChartLine,
    path: RouteNamesEnum.dashboardOverview
  },
  {
    title: 'Launch Token',
    icon: faRocket,
    path: RouteNamesEnum.dashboardCreate
  },
  {
    title: 'Launch NFT',
    icon: faPalette,
    path: RouteNamesEnum.dashboardCreateNFT
  },
  {
    title: 'NFT Market',
    icon: faGem,
    path: RouteNamesEnum.dashboardNFTs
  }
];

export const SideMenu = ({ setIsOpen }: SideMenuPropsType) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const handleMenuItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className={styles.sideMenuContainer}>
      <div className={styles.sideMenuHeader}>
        <h2 className={styles.sideMenuHeaderTitle}>App</h2>

        <FontAwesomeIcon
          icon={faChevronUp}
          className={classNames(styles.sideMenuHeaderIcon, {
            [styles.sideMenuHeaderIconRotated]: isCollapsed
          })}
          onClick={toggleCollapse}
        />
      </div>

      <div
        className={classNames(styles.sideMenuItems, {
          [styles.sideMenuItemsHidden]: isCollapsed
        })}
      >
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleMenuItemClick(item.path)}
            className={classNames(styles.sideMenuItem, {
              [styles.sideMenuItemActive]: item.path === pathname
            })}
          >
            {item.icon && <ItemIcon icon={item.icon} />}

            <div className={styles.sideMenuItemTitle}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
