import fs from 'fs';
import path from 'path';

////////////////////////////////////////////////////////////////////////////////

const getRequireJs = (): string => {
  console.log('------------------------5---------------------', path.join(__dirname, '../../client', 'require.js'));
  const requireJs = fs.readFileSync(path.join(__dirname, '../../client', 'require.js'), 'utf-8');
  return requireJs;
};

const getLoadEventsJs = (): string => {
  console.log('------------------------6---------------------', path.join(__dirname, '../../client', 'loadEvents.js'));
  const loadEventsJs = fs.readFileSync(path.join(__dirname, '../../client', 'loadEvents.js'), 'utf-8');
  return loadEventsJs;
};

////////////////////////////////////////////////////////////////////////////////

export { getRequireJs, getLoadEventsJs };
