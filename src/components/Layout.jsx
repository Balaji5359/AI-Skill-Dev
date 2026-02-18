import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const hideMainHeaderRoutes = new Set(['/student-dashboard/jam']);
  const shouldHideHeader = hideMainHeaderRoutes.has(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className={`main-content ${shouldHideHeader ? 'no-header' : ''}`}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
