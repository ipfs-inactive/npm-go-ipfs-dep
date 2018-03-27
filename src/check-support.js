'use strict'

// TODO: get the supported platforms, versions and archs from:
// https://dist.ipfs.io/go-ipfs/versions and https://dist.ipfs.io/go-ipfs/<version>/dist.json

// The packages we support
const supportedPlatforms = ['linux', 'darwin', 'windows', 'freebsd']
const supportedArchs = ['amd64', '386', 'arm']
const supportedVersions = [
  'sharding-pre',
  'v0.3.2',
  'v0.3.4',
  'v0.3.5',
  'v0.3.6',
  'v0.3.7',
  'v0.3.8',
  'v0.3.9',
  'v0.3.10',
  'v0.3.11',
  'v0.4.0',
  'v0.4.1',
  'v0.4.2',
  'v0.4.3',
  'v0.4.4',
  'v0.4.5',
  'v0.4.6',
  'v0.4.7',
  'v0.4.8',
  'v0.4.9',
  'v0.4.10',
  'v0.4.11',
  'v0.4.12',
  'v0.4.13',
  'v0.4.14'
]

// Check functions
const isSupportedVersion = (version) => supportedVersions.indexOf(version) !== -1
const isSupportedPlatform = (platform) => supportedPlatforms.indexOf(platform) !== -1
const isSupportedArch = (arch) => supportedArchs.indexOf(arch) !== -1

// Is the platform Windows?
function isWindows (os) {
  return os === 'windows'
}

// Validate the requested binary support, throw en error if not supported
function verify (version, platform, arch) {
  if (!isSupportedArch(arch)) {
    throw new Error(`No binary available for arch '${arch}'`)
  }

  if (!isSupportedPlatform(platform)) {
    throw new Error(`No binary available for platform '${platform}'`)
  }

  if (!isSupportedVersion(version)) {
    throw new Error(`Version '${version}' not available`)
  }

  return true
}

// Public API
module.exports = {
  Versions: supportedVersions,
  Platforms: supportedPlatforms,
  Archs: supportedArchs,
  isSupportedVersion: isSupportedVersion,
  isSupportedPlatform: isSupportedPlatform,
  isSupportedArch: isSupportedArch,
  isWindows: isWindows,
  verify: verify
}
