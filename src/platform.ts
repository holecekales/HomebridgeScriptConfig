import { join, dirname } from 'path';

import { existsSync } from 'fs';
import * as fs from 'fs';

// @ts-expect-error No types available
import editDotenv from 'edit-dotenv';

import { exec } from 'child_process';
import { 
  API, 
  DynamicPlatformPlugin, 
  Logger, 
  PlatformConfig,
  PlatformAccessory,
} from 'homebridge';


export class ScriptConfigPlatform implements DynamicPlatformPlugin {

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.info('ScriptConfig plugin loaded');

    this.updateEnvIfNeeded();

    if (this.config.runOnStartup) {
      this.runScript();
    }
  }

  private resolveEnvPath(): string {

    if(!this.config.scriptPath) {
      this.log.warn('No scriptPath configured.');
      return '';
    }

    const scriptPath = this.config.scriptPath;
    let envPath: string;
    
    // Case 1: path ends with .env and exists
    if (scriptPath.endsWith('.env') && existsSync(scriptPath)) {
      envPath = scriptPath;
    } else {
      // Case 2: it's a script or directory → resolve to dirname
      const baseDir = fs.statSync(scriptPath).isDirectory() ? scriptPath : dirname(scriptPath);
      envPath = join(baseDir, '.env');
    }

    return envPath;
  }


  private updateEnvIfNeeded() {

    const envPath : string  = this.resolveEnvPath();

    if (existsSync(envPath)) {
      
      this.log.info(`Loading .env from: ${envPath}`);
      const rawEnv = fs.readFileSync(envPath, 'utf-8');
      // const parsedEnv = editDotenv.parse(rawEnv);
      this.log.info('Parsed .env:', rawEnv);
    } else {
      this.log.warn(`No .env file found at: ${envPath}`);
    }

    // Now you can safely use process.env.OWM_API_KEY, etc.
    // this.log.info(`OpenWeatherMap API key is: ${process.env.OWM_API_KEY ?? '(not set)'}`);
  
  }

  private runScript() {
    if (!this.config.scriptPath) {
      this.log.warn('No scriptPath configured.');
      return;
    }

   
    exec(`python3 ${this.config.scriptPath} ${this.config.scriptArgs || ''}`, (err, stdout, stderr) => {
      if (err) {
        this.log.error(`Script failed: ${stderr}`);
      } else {
        this.log.info(`Script output: ${stdout}`);
      }
    });
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.debug('configureAccessory called, but not used:', accessory.displayName);
  }
}
