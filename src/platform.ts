import {API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service} from 'homebridge'

import {PLATFORM_NAME, PLUGIN_NAME} from './settings'
import {DockerPlatformAccessory} from './platformAccessory'

import Docker from 'dockerode'

interface DockerPlatformConfig extends PlatformConfig {
  host?: string;
  port?: number;
  secureDelayTimeout?: number;
}

export class DockerHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = []

  public readonly dockerConfig: DockerPlatformConfig
  public readonly docker: Docker

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.dockerConfig = config

    this.log.info('Creating Docker API object', this.dockerConfig.host!)
    if (this.dockerConfig.host!.startsWith('unix://')) {
      this.docker = new Docker(
        {socketPath: this.dockerConfig.host!},
      )
    } else {
      this.docker = new Docker(
        {host: this.dockerConfig.host!, port: this.config.port!},
      )
    }

    this.api.on('didFinishLaunching', () => {
      this.log.info(`Finished initializing Docker@${this.config.host} platform`)
      this.discoverDevices()
    })
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName)
    this.accessories.push(accessory)
  }

  /**
   * Find all containers and map meta values
   */
  discoverDevices() {
    // Add containers
    this.docker.listContainers({all: true}, (err, containers) => {
      if (err) {
        this.log.error(String(err))
      } else {
        this.log.debug(JSON.stringify(containers))
      }

      containers?.forEach((container) => {
        const uuid = this.api.hap.uuid.generate(container.Id)

        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)

        if (existingAccessory) {
          new DockerPlatformAccessory(this, existingAccessory)
        } else {
          const name = container.Names.join(' ').replace('/', '')
          const accessory = new this.api.platformAccessory(
            name, uuid,
          )

          accessory.context.device = container
          accessory.context.device.Name = name

          new DockerPlatformAccessory(this, accessory)
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
        }
      })
    })
  }
}
