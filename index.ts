import ssrsx, { SsrsxOptions } from './src/';
import { initializeParse, events } from './src/core/eventSupport';
import { getRequireJs, getLoadEventsJs } from './src/core/getJs';
import { getDir } from './src/lib/getDir';
import { readdirSyncRecursively } from './src/lib/readdirSyncRecursively';
//
export default ssrsx;
export { ssrsx, SsrsxOptions };
export { initializeParse, events, getRequireJs, getLoadEventsJs, getDir, readdirSyncRecursively };
