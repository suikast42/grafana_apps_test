import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;
export const PLUGIN_API_BASE_URL = `api/plugins/${pluginJson.id}`;

export enum ROUTES {
  Home = 'home',
  WithTabs = 'page-with-tabs',
  Repeating = 'page-with-repeats',
  WithDrilldown = 'page-with-drilldown',
  HelloWorld = 'hello-world',
}

export const DATASOURCE_REF = {
  uid: 'gdev-testdata',
  type: 'testdata',
};

export const DATASOURCE_CUSTOMDS_REF = {
  uid: 'demods',
  type: 'acme-demods-datasource',
};
