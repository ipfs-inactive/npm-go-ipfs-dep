'use strict'
/*
  Download go-ipfs distribution package for desired version, platform and architecture,
  and unpack it to a desired output directory.

  API:
    download([<version>, <platform>, <arch>, <outputPath>])

  Defaults:
    go-ipfs version: value in package.json/go-ipfs/version
    go-ipfs platform: the platform this program is run from
    go-ipfs architecture: the architecture of the hardware this program is run from
    go-ipfs install path: './go-ipfs'

  Example:
    const download = require('go-ipfs-dep')

    download("v0.4.5", "linux", "amd64", "/tmp/go-ipfs"])
      .then((res) => console.log('filename:', res.file, "output:", res.dir))
      .catch((e) => console.error(e))
*/
const goenv = require('go-platform')
const gunzip = require('gunzip-maybe')
const path = require('path')
const request = require('request')
const tarFS = require('tar-fs')
const unzip = require('unzip')
const support = require('./check-support')
const pkg = require('./../package.json')

// Check package.json for default config
const goIpfsInfo = pkg['go-ipfs']

const goIpfsVersion = (goIpfsInfo && goIpfsInfo.version)
  ? pkg['go-ipfs'].version
  : 'v' + pkg.version.replace(/-[0-9]+/, '')

let distUrl = (goIpfsInfo && goIpfsInfo.distUrl)
  ? pkg['go-ipfs'].distUrl
  : 'https://dist.ipfs.io'

// Main function
function download (version, platform, arch, installPath) {
  return new Promise((resolve, reject) => {
    //            Environment Variables           Args        Defaults
    version = process.env.TARGET_VERSION || version || goIpfsVersion
    platform = process.env.TARGET_OS || platform || goenv.GOOS
    arch = process.env.TARGET_ARCH || arch || goenv.GOARCH
    distUrl = process.env.GO_IPFS_DIST_URL || distUrl
    installPath = installPath ? path.resolve(installPath) : path.resolve(process.cwd())

    // Make sure we support the requested package
    try {
      support.verify(version, platform, arch)
    } catch (e) {
      return reject(e)
    }

    // Flag for Windows
    const isWindows = support.isWindows(platform)

    // Create the download url
    const fileExtension = isWindows ? '.zip' : '.tar.gz'
    const fileName = 'ipfs_' + version + '_' + platform + '-' + arch + fileExtension
    const url = distUrl + '/go-ipfs/' + version + '/go-' + fileName

    // Success callback wrapper
    // go-ipfs contents are in 'go-ipfs/', so append that to the path
    const done = () => resolve({
      fileName: fileName,
      installPath: path.join(installPath, '/go-ipfs/')
    })

    // Unpack the response stream
    const unpack = (stream) => {
      // TODO: handle errors for both cases
      if (isWindows) {
        return stream.pipe(
          unzip
            .Extract({ path: installPath })
            .on('close', done)
        )
      }

      return stream
        .pipe(gunzip())
        .pipe(
          tarFS
            .extract(installPath)
            .on('finish', done)
        )
    }

    // Start
    process.stdout.write(`Downloading ${url}\n`)

    request.get(url, (err, res, body) => {
      if (err) {
        // TODO handle error: haad?
      }
      // Handle errors
      if (res.statusCode !== 200) {
        reject(new Error(`${res.statusCode} - ${res.body}`))
      }
    })
    .on('response', (res) => {
      // Unpack only if the request was successful
      if (res.statusCode !== 200) {
        return
      }

      unpack(res)
    })
  })
}

module.exports = download
