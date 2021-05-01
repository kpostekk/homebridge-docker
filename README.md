# Homebridge Docker plugin

Integrate your precious containers with your home

![npm](https://img.shields.io/npm/dm/homebridge-docker?style=flat-square) ![npm](https://img.shields.io/npm/v/homebridge-docker?style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/homebridge-docker?style=flat-square)

## Install

```shell
sudo npm i -g homebridge-docker
```

## Configuration

#### Host
Can be unix socket or http address.

#### Port
Specify port for http connection (not required for unix socket).

#### Secure delay timeout *(experimental)*

Feature to prevent miss clicks, probably not working.

### Authentication *(experimental)*

To authenticate with certs, encode them with base64 and pass them to config.

## Usage

<img src="https://raw.githubusercontent.com/kpostekk/homebridge-docker/main/.github/21-04-11%2017-37-49%201563.png" height="370"><img src="https://raw.githubusercontent.com/kpostekk/homebridge-docker/main/.github/21-04-11%2017-38-00%201564.png" height="370">
