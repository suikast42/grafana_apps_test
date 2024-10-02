import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import PageWithRepeating from "../../pages/Repeating/PageWithRepeating";
const HomePage = React.lazy(() => import('../../pages/Home/Home'));
const PageWithTabs = React.lazy(() => import('../../pages/WithTabs/WithTabs'));
const WithDrilldown = React.lazy(() => import('../../pages/WithDrilldown/WithDrilldown'));
const HelloWorld = React.lazy(() => import('../../pages/HelloWorld/HelloWorld'));

export const Routes = () => {
  return (
    <Switch>
      <Route path={prefixRoute(`${ROUTES.WithTabs}`)} component={PageWithTabs} />
      <Route path={prefixRoute(`${ROUTES.WithDrilldown}`)} component={WithDrilldown} />
      <Route path={prefixRoute(`${ROUTES.Home}`)} component={HomePage} />
      <Route path={prefixRoute(`${ROUTES.HelloWorld}`)} component={HelloWorld} />
      <Route path={prefixRoute(`${ROUTES.Repeating}`)} component={PageWithRepeating} />
      <Redirect to={prefixRoute(ROUTES.Home)} />
    </Switch>
  );
};
