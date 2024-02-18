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

export { getRequireJs, getLoadEventsJs };

////////////////////////////////////////////////////////////////////////////////

interface ElementEvent {
  target: string,
  event: string,
  //
  module: string,
  f: string,
}

let uidSource = 0;
let events: ElementEvent[] = [];
let uidPrefix: string = '';

const initializeParse = (prefix: string = 'u') => {
  uidSource = 0;
  events = [];
  uidPrefix = prefix;
};

const  createUid = () => {
  return uidPrefix + ('000000'+(uidSource++).toString(36)).slice(-6);
};

export { initializeParse, createUid, events };
