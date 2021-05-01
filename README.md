# Homebridge Docker plugin

Integrate your precious containers with your home

![npm](https://img.shields.io/npm/dm/homebridge-docker?style=flat-square)![npm](https://img.shields.io/npm/v/homebridge-docker?style=flat-square)![npm bundle size](https://img.shields.io/bundlephobia/minzip/homebridge-docker?style=flat-square)

## Install

```shell
sudo npm i -g homebridge-docker
```

## Configuration

```json
{
  "host": "http://192.168.1.91", 
  "port": 2375, 
  "platform": "Docker"
}
```

### Authentication

To authenticate with certs, encode them with base64 and pass them to config.
You can use `base64` to encode them.

## Usage

<img src="https://raw.githubusercontent.com/kpostekk/homebridge-docker/main/.github/21-04-11%2017-37-49%201563.png" height="370"><img src="https://raw.githubusercontent.com/kpostekk/homebridge-docker/main/.github/21-04-11%2017-38-00%201564.png" height="370">
