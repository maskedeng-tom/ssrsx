import fs from 'fs';
import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import path from 'path';
import childProcess from 'child_process';
import { TscOption } from '../core';
import { errorConsole } from '../lib/errorConsole';

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

const changeExt = (filename: string, ext: string) => {
  const extname = path.extname(filename);
  return filename.replace(new RegExp(`${extname}$`), ext);
};

const createCompiler = (clientRoot: string, workRoot: string, tscOptions: TscOption) => {

  const jsCache: { [key: string]: string } = {};

  const compile = async (jsUrl: string) => {
    // check cache
    if(jsCache[jsUrl]){
      return jsCache[jsUrl];
    }

    // target js file
    const ext = path.extname(jsUrl);
    if(ext !== '.js'){
      return;
    }

    // create tsc options
    const offsetPath = jsUrl.split('/').slice(0, -1).join('/');
    tscOptions.outDir = path.join(workRoot, offsetPath);
    //
    const options: string[] = [];
    for(const key in tscOptions){
      options.push(`--${key} ${tscOptions[key as keyof typeof tscOptions]}`);
    }

    // ts filename
    let ts = changeExt(jsUrl, '.client.ts');
    let tsPath = path.join(clientRoot, ts);
    if(!fs.existsSync(tsPath)){
      ts = changeExt(jsUrl, '.client.tsx');
      tsPath = path.join(clientRoot, ts);
      if(!fs.existsSync(tsPath)){
        return;
      }
    }

    if(tsPath.indexOf(clientRoot) !== 0){
      return false;
    }

    // compile
    const outputFileName = path.join(workRoot, changeExt(jsUrl, '.client.js'));
    //
    const cmd = `tsc ${tsPath} ${options.join(' ')}`;
    const compileResult = await execSync(cmd);
    if(!compileResult.result){
      logError(`Compile error: ${jsUrl} ${tsPath} ${compileResult.stdout}`);
      return errorConsole('Compile error', `${tsPath}\n\t${compileResult.stdout}`);
    }
    log(`Compiled: ${tsPath} (${jsUrl})`);
    if(fs.existsSync(outputFileName)){
      const js = fs.readFileSync(outputFileName).toString();
      fs.unlinkSync(outputFileName);
      if(js){
        return jsCache[jsUrl] = js;
      }
    }
    return;
    //
  };

  return {
    compile,
  };

};

////////////////////////////////////////////////////////////////////////////////

export { createCompiler };