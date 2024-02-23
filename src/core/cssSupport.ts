import { SassStyles } from '../styleToString/cssTypes';
import { styleToString } from '../styleToString/styleToString';
import { shortId } from '../lib/shortId';

////////////////////////////////////////////////////////////////////////////////

let styles: string[] = [];

////////////////////////////////////////////////////////////////////////////////

const initializeStyles = () => {
  styles = [];
};

const setGlobalStyle = (sass: SassStyles) => {
  styles.push(styleToString(sass));
};

const setScopedStyle = (sass: SassStyles) => {
  const scope = shortId('sc');
  styles.push(styleToString(sass, `data-ssrsx-css="${scope}"`));
  return {'data-ssrsx-css': scope};
};

const getStyles = () => {
  return styles.join('\n');
};

////////////////////////////////////////////////////////////////////////////////

export { initializeStyles, setGlobalStyle, setScopedStyle, getStyles, styleToString };