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
const tarFS = require('tar-fs')
const unzip = require('unzip-stream')
const fetch = require('node-fetch')
const pkg = require('./../package.json')

function unpack ({ url, installPath, stream }) {
  return new Promise((resolve, reject) => {
    if (url.endsWith('.zip')) {
      return stream.pipe(
        unzip
          .Extract({ path: installPath })
          .on('close', resolve)
          .on('error', reject)
      )
    }

    return stream
      .pipe(gunzip())
      .pipe(
        tarFS
          .extract(installPath)
          .on('finish', resolve)
          .on('error', reject)
      )
  })
}

async function download ({ installPath, url }) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`unexpected status ${res.status}`)
  return unpack({ url, installPath, stream: res.body })
}

function cleanArguments (version, platform, arch, installPath) {
  const goIpfsInfo = pkg['go-ipfs']

  const goIpfsVersion = (goIpfsInfo && goIpfsInfo.version)
    ? pkg['go-ipfs'].version
    : 'v' + pkg.version.replace(/-[0-9]+/, '')

  const distUrl = (goIpfsInfo && goIpfsInfo.distUrl)
    ? pkg['go-ipfs'].distUrl
    : 'https://dist.ipfs.io'

  return {
    version: process.env.TARGET_VERSION || version || goIpfsVersion,
    platform: process.env.TARGET_OS || platform || goenv.GOOS,
    arch: process.env.TARGET_ARCH || arch || goenv.GOARCH,
    distUrl: process.env.GO_IPFS_DIST_URL || distUrl,
    installPath: installPath ? path.resolve(installPath) : process.cwd()
  }
}

async function ensureVersion ({ version, distUrl }) {
  const res = await fetch(`${distUrl}/go-ipfs/versions`)
  const versions = (await res.text()).trim().split('\n')

  if (versions.indexOf(version) === -1) {
    throw new Error(`Version '${version}' not available`)
  }
}

async function getDownloadURL ({ version, platform, arch, distUrl }) {
  await ensureVersion({ version, distUrl })

  const dist = await fetch(`${distUrl}/go-ipfs/${version}/dist.json`)
  const data = await dist.json()

  if (!data.platforms[platform]) {
    throw new Error(`No binary available for platform '${platform}'`)
  }

  if (!data.platforms[platform].archs[arch]) {
    throw new Error(`No binary available for arch '${arch}'`)
  }

  const link = data.platforms[platform].archs[arch].link
  return `${distUrl}/go-ipfs/${version}${link}`
}

module.exports = async function () {
  const args = cleanArguments(...arguments)
  const url = await getDownloadURL(args)

  process.stdout.write(`Downloading ${url}\n`)

  await download({ ...args, url })

  return {
    fileName: url.split('/').pop(),
    installPath: path.join(args.installPath, 'go-ipfs')
  }
}
