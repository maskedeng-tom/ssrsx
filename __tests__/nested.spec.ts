/**
 * @jest-environment node
**/
import { nestedStyleToString } from '../src/hooks/styleToString/nested';

describe('styleToString', () => {
  test('basic', () => {

    expect(nestedStyleToString({
      color: 'aqua',
      opacity: 1,
      borderBottom: 3,
    })).toBe('color:aqua;opacity:1;border-bottom:3px;');

    expect(nestedStyleToString({
      border: [1, 'solid', 'red'],
    })).toBe('border:1px solid red;');

    expect(nestedStyleToString({
      '.test':{
        color: 'aqua',
        opacity: 1,
        borderBottom: 3,
      }
    })).toBe('.test{color:aqua;opacity:1;border-bottom:3px;}');

    expect(nestedStyleToString({
      '.test':{
        color: 'aqua',
        opacity: 1,
        borderBottom: 3,
        '.sample':{
          color: 'gray',
        }
      }
    })).toBe('.test{color:aqua;opacity:1;border-bottom:3px;.sample{color:gray;}}');

    expect(nestedStyleToString({
      '.test ::v-scope':{
        color: 'aqua',
        opacity: 1,
        borderBottom: 3,
      }
    }, 'sc12345')).toBe('.test [sc12345]{color:aqua;opacity:1;border-bottom:3px;}');

  });

});
