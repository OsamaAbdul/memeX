import { PropsWithChildren, useEffect } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useGetIsLoggedIn } from 'lib';
import { RouteNamesEnum } from 'localConstants';
import { routes } from 'routes';

export const AuthRedirectWrapper = ({ children }: PropsWithChildren) => {
  const isLoggedIn = useGetIsLoggedIn();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentRoute = routes.reduce((acc, route) => {
    if (acc) return acc;
    if (matchPath(route.path, pathname)) return route;
    if (route.children) {
      const matchedChild = route.children.find((child) =>
        matchPath(child.path, pathname)
      );
      if (matchedChild) return { ...matchedChild, authenticatedRoute: route.authenticatedRoute };
    }
    return acc;
  }, undefined as any);

  const requireAuth = Boolean(currentRoute?.authenticatedRoute);

  useEffect(() => {
    if (isLoggedIn && !requireAuth && pathname !== RouteNamesEnum.unlock) {
      // If logged in and on a non-auth page (like home), redirect to dashboard
      // But allow staying on non-auth pages if they are not the 'unlock' page
      // Actually, standard behavior is to redirect from unlock/home if logged in
      if (pathname === RouteNamesEnum.home || pathname === RouteNamesEnum.unlock) {
        navigate(RouteNamesEnum.dashboard);
      }
      return;
    }

    if (!isLoggedIn && requireAuth) {
      navigate(RouteNamesEnum.unlock);
    }
  }, [isLoggedIn, currentRoute, pathname]);

  return <>{children}</>;
};
