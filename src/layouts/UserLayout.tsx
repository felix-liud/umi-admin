import { ConnectProps, ConnectState } from '@/models/connect';
import { getMenuData, getPageTitle, MenuDataItem } from '@ant-design/pro-layout';
import { connect } from 'dva';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'umi';

import logo from '../assets/logo.svg';
import Footer from '../components/Footer';
import styles from './UserLayout.less';

export interface UserLayoutProps extends ConnectProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
}

const UserLayout: React.FC<UserLayoutProps> = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    ...props,
  });
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>管理系统</span>
              </Link>
            </div>
          </div>
          {children}
        </div>
        <Footer/>
      </div>
    </>
  );
};

export default connect(({ settings }: ConnectState) => ({ ...settings }))(UserLayout);
