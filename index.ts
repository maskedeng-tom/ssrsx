import ssrsx, { SsrsxOptions } from './src/';
//
export { ssrsx, SsrsxOptions };
export default ssrsx;

import { initializeParse, events } from './src/eventSupport';
import { getRequireJs, getLoadEventsJs } from './src/getJs';
import { getDir } from './src/lib/getDir';
import { readdirSyncRecursively } from './src/lib/readdirSyncRecursively';

export { initializeParse, events, getRequireJs, getLoadEventsJs, getDir, readdirSyncRecursively };