import fs from 'fs';
import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import path from 'path';
import childProcess from 'child_process';
import { readdirSyncRecursively } from '../lib/readdirSyncRecursively';
import { TscOption } from '../types/TscOption';

const createCompiler = () => {

  const jsCache: { [key: string]: string } = {};

  let compiled = false;
  const compile = async (clientRoot: string, workRoot: string, tscOptions: TscOption) => {
    if(compiled){
      return;
    }
    compiled = true;

    return new Promise((resolve) => {
      //
      let errorCount = 0;
      const files = readdirSyncRecursively(clientRoot);
      if(files.length === 0){
        resolve(true);
        return;
      }
      //
      for(let i = 0; i < files.length; i++){
        // target ts(x) file
        const file = files[i].slice(clientRoot.length + 1);
        const ext = path.extname(file);
        if(ext !== '.ts' && ext !== '.tsx'){
          continue;
        }

        // create tsc options
        const offsetPath = file.split('/').slice(0, -1).join('/');
        tscOptions.outDir = path.join(workRoot, offsetPath);
        //
        const options: string[] = [];
        for(const key in tscOptions){
          options.push(`--${key} ${tscOptions[key as keyof typeof tscOptions]}`);
        }

        // compile
        const fileName = path.join(clientRoot, file);
        const outputFileName = path.join(workRoot, file).split('.').slice(0, -1).join('.') + '.js';
        //
        const cmd = `tsc ${fileName} ${options.join(' ')}`;
        childProcess.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            ++errorCount;
            logError(`Compile error: ${file}\n${stderr}`);
          }else{
            log(`Compiled: ${file}`);
            if(fs.existsSync(outputFileName)){
              const js = fs.readFileSync(outputFileName).toString();
              if(js){
                jsCache[file.split('.').slice(0, -1).join('.') + '.js'] = js;
              }
            }
          }
          if(i === files.length - 1){
            resolve(errorCount === 0);
          }
        });
      }
      //
    });
  };

  const getJs = (file: string) => {
    return jsCache[file];
  };

  return {
    compile,
    getJs,
  };

};

export { createCompiler };