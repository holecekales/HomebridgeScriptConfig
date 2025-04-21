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

    if (this.config.runOnStartup) {
      this.runScript();
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.debug('configureAccessory called, but not used:', accessory.displayName);
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
}
