import fs from 'fs';
import path from 'path';

////////////////////////////////////////////////////////////////////////////////

const getRequireJs = (): string => {
  const requireJs = fs.readFileSync(path.join(__dirname, '../client', 'require.js'), 'utf-8');
  return requireJs;
};

const getLoadEventsJs = (): string => {
  const loadEventsJs = fs.readFileSync(path.join(__dirname, '../client', 'loadEvents.js'), 'utf-8');
  return loadEventsJs;
};

////////////////////////////////////////////////////////////////////////////////

export { getRequireJs, getLoadEventsJs };
