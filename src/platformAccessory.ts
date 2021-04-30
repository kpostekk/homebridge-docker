import {CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge'

import {DockerHomebridgePlatform} from './platform'


export class DockerPlatformAccessory {
  private service: Service
  private readonly log: Logger
  private readonly secureDelayTimeout?: number

  private states = {
    On: false,
    SecureDelay: false, // indicates
    SecureDelayMissClickDetection: true,
  }

  constructor(
    private readonly platform: DockerHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // copy logging
    this.log = this.platform.log

    // read secure delay settings
    if (this.platform.config.secureDelayTimeout > 0) {
      this.secureDelayTimeout = this.platform.config.secureDelayTimeout
    }

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Docker')
      .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.device.Image.substr(0, 24))
      .setCharacteristic(this.platform.Characteristic.SerialNumber, String(this.accessory.context.device.Id).substr(0, 16))

    // set switch service
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch)
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.Name)
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this))
  }

  /**
   * Set status of container
   * @param value
   */
  async setOn(value: CharacteristicValue) {
    // Add some log readability
    this.log.debug(`Performing action for ${this.accessory.context.device.Name}`)


    // Secure delay border
    if (this.secureDelayTimeout) {
      if (this.states.SecureDelay) {
        // When last previous secure delay hasn't passed
        this.log.debug('Secure delay has been already triggered, mocking change, setting miss click flag and return')
        this.states.On = !this.states.On // switch state
        this.states.SecureDelayMissClickDetection = true
        return
      } else {
        // When secure delay wasn't detected
        this.log.debug('No secure delay, triggering one')
        this.states.SecureDelay = true // change state
        this.states.On = !this.states.On // switch state
      }

      // performing delay
      this.log.debug(`Performing delay (${this.secureDelayTimeout!})`)
      await new Promise(resolve => setTimeout(resolve, this.secureDelayTimeout!))

      // Disable secure delay lock
      this.log.debug('Disabling secure delay lock')
      this.states.SecureDelay = false

      // Check miss click flag
      if (this.states.SecureDelayMissClickDetection) {
        this.log.debug('Miss click detected, clearing flag and return')
        this.states.SecureDelayMissClickDetection = false
        return
      }
    }


    // Main switch mechanism
    if (value) { // start container
      this.log.debug('Starting...')
      this.platform.docker.getContainer(
        this.accessory.context.device.Id,
      ).start()
        .then(() => {
          this.states.On = true
        })
        .catch(() => {
          this.states.On = true
        })
    } else { // stop container
      this.log.debug('Stopping...')
      this.platform.docker.getContainer(
        this.accessory.context.device.Id,
      ).stop()
        .then(() => {
          this.states.On = false
        })
        .catch(() => {
          this.states.On = false
        })
    }
  }

  /**
   * Get status of container
   */
  async getOn(): Promise<CharacteristicValue> {
    if (this.states.SecureDelay) {
      this.log.debug(`Found secure delay lock, mocking state of ${this.accessory.context.device.Name}`)
      return this.states.On
    }

    const inspection = await this.platform.docker.getContainer(
      this.accessory.context.device.Id,
    ).inspect()

    return inspection.State.Running
  }
}
