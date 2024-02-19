import fs from 'fs';
import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import path from 'path';
import childProcess from 'child_process';
import { readdirSyncRecursively } from '../lib/readdirSyncRecursively';
import { TscOption } from '../types/TscOption';

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const execSync = async (cmd: string): Promise<{result: boolean, err: childProcess.ExecException | null, stdout: any, stderr: any}> => {
  return new Promise((resolve) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        resolve({result: false, err, stdout, stderr});
      }else{
        resolve({result: true, err, stdout, stderr});
      }
    });
  });
};

////////////////////////////////////////////////////////////////////////////////

const createCompiler = () => {

  const jsCache: { [key: string]: string } = {};

  let compiled = false;
  const compile = async (clientRoot: string, workRoot: string, tscOptions: TscOption) => {
    if(compiled){
      return;
    }
    compiled = true;

    let errorCount = 0;

    const files = readdirSyncRecursively(clientRoot);
    if(files.length === 0){
      return true;
    }

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
      if(!(await execSync(cmd)).result){
        ++errorCount;
        logError(`Compile error: ${file}`);
      }else{
        log(`Compiled: ${file}`);
        if(fs.existsSync(outputFileName)){
          const js = fs.readFileSync(outputFileName).toString();
          if(js){
            jsCache[file.split('.').slice(0, -1).join('.') + '.js'] = js;
          }
        }
      }
    }
    //
    return(errorCount === 0);
    //
  };

  const getJs = (file: string) => {
    return jsCache[file];
  };

  return {
    compile,
    getJs,
  };

};

////////////////////////////////////////////////////////////////////////////////

export { createCompiler };