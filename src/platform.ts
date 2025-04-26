// import { join, dirname } from 'path';
// import { existsSync } from 'fs';
// import * as fs from 'fs';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

// import { exec } from 'child_process';
import { 
  API,  
  DynamicPlatformPlugin, 
  Logger, 
  PlatformConfig,
  PlatformAccessory,
} from 'homebridge';


export class ScriptConfigPlatform implements DynamicPlatformPlugin {
 
  private readonly accessories: PlatformAccessory[] = [];
  
  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    
    this.api.on('didFinishLaunching', () => {
      this.createOrRestoreContactSensor();
    });
  }
 
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info(`Restoring cached accessory: ${accessory.displayName}`);
    this.accessories.push(accessory);
  }

  private createOrRestoreContactSensor(): void {
    const uuid = this.api.hap.uuid.generate(this.config.ACCESSORY_ID || 'sun-incline');
    let accessory = this.accessories.find(a => a.UUID === uuid);

    if (!accessory) {
      this.log.info('Adding new Contact Sensor accessory');

      accessory = new this.api.platformAccessory('Sun Incline Sensor', uuid);
      accessory.context.device = {
        id: this.config.ACCESSORY_ID || 'sun-incline',
      };

      const service = accessory.addService(this.api.hap.Service.ContactSensor);
      service.setCharacteristic(this.api.hap.Characteristic.ContactSensorState, 0); // 0 = contact

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    } else {  
      this.log.info('Reinitializing existing Contact Sensor accessory');
    }

    this.accessories.push(accessory);
  }

  private updateContactSensorState(state: 0 | 1): void {
    const accessory = this.accessories.find(a => a.context.device?.id === (this.config.ACCESSORY_ID || 'sun-incline'));
    if (!accessory) {
      return;
    }

    const service = accessory.getService(this.api.hap.Service.ContactSensor);
    if (service) {
      service.updateCharacteristic(this.api.hap.Characteristic.ContactSensorState, state);
      this.log.info(`Updated Contact Sensor state to: ${state === 0 ? 'Contact' : 'No Contact'}`);
    }
  }
}
