import {CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge'

import {DockerHomebridgePlatform} from './platform'


export class DockerPlatformAccessory {
  private service: Service
  private readonly log: Logger

  private states = {
    On: false,
  }

  constructor(
    private readonly platform: DockerHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // copy logging
    this.log = this.platform.log

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
  setOn(value: CharacteristicValue) {
    if (value) {
      this.platform.docker.getContainer(
        this.accessory.context.device.Id,
      ).start()
        .then(() => {
          this.states.On = true as boolean
        })
    } else {
      this.platform.docker.getContainer(
        this.accessory.context.device.Id,
      ).stop()
        .then(() => {
          this.states.On = false as boolean
        })
        .catch(() => {
          this.states.On = false as boolean
        })
    }
  }

  /**
   * Get status of container
   */
  async getOn(): Promise<CharacteristicValue> {
    const inspection = await this.platform.docker.getContainer(
      this.accessory.context.device.Id,
    ).inspect()

    return inspection.State.Running
  }
}
