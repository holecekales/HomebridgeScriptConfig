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
  // Plugin configuration values
  private readonly OWM_API_KEY: string;
  private readonly CITY_NAME: string;
  private readonly LATITUDE: number;
  private readonly LONGITUDE: number;
  private readonly TIMEZONE: string;
  private readonly COUNTRY_NAME: string;
  private readonly SUN_ANGLE_MIN: number;
  private readonly SUN_ANGLE_MAX: number;
  private readonly AZIMUTH_MIN: number;
  private readonly AZIMUTH_MAX: number;
  private readonly BRITNESS_CLOSE_THRESHOLD: number;
  private readonly ACCESSORY_ID: string;
  private readonly HOMEBRIDGE_HOST: string;
  private readonly HOMEBRIDGE_PORT: number;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    
    this.log.info('ScriptConfig plugin loaded');

    // OpenWeatherMap API key
    this.OWM_API_KEY = config.OWM_API_KEY;
    
    // Locaton
    this.CITY_NAME = config.CITY_NAME;
    this.LATITUDE = parseFloat(config.LATITUDE);
    this.LONGITUDE = parseFloat(config.LONGITUDE);
    this.TIMEZONE = config.TIMEZONE;
    this.COUNTRY_NAME = config.COUNTRY_NAME;
    
    // Sun angle limits
    this.SUN_ANGLE_MIN = parseFloat(config.SUN_ANGLE_MIN);
    this.SUN_ANGLE_MAX = parseFloat(config.SUN_ANGLE_MAX);
    this.AZIMUTH_MIN = parseFloat(config.AZIMUTH_MIN);
    this.AZIMUTH_MAX = parseFloat(config.AZIMUTH_MAX);
    this.BRITNESS_CLOSE_THRESHOLD = parseFloat(config.BRITNESS_CLOSE_THRESHOLD);
   
    // Homebridge specific
    this.ACCESSORY_ID = config.ACCESSORY_ID;
    this.HOMEBRIDGE_HOST = config.HOMEBRIDGE_HOST;
    this.HOMEBRIDGE_PORT = parseInt(config.HOMEBRIDGE_PORT, 10);

    if (this.config.runOnStartup) {
      this.runScript();
    }
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
