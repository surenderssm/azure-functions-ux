import * as ReactDOM from 'react-dom';

import 'react-app-polyfill/ie11';
import './polyfills';

import { initializeIcons, loadTheme } from '@fluentui/react';

import App from './pages/App';
import { lightTheme } from './theme/light';
import LogService from './utils/LogService';
import Url from './utils/url';

LogService.initialize();
initializeIcons(Url.getParameterByName(null, 'officeFabricIconsCdn') || undefined);
loadTheme(lightTheme); // make sure we load a custom theme before anything else, custom theme has custom semantic colors

LogService.startTrackPage('shell');

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
