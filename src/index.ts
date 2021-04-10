import {AccessoryConfig, AccessoryPlugin, API, Logger, Logging, Service, HAP} from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { DockerHomebridgePlatform } from './platform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, DockerHomebridgePlatform);
};
