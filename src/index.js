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
const pkgConf = require('pkg-conf')
const pkg = require('./../package.json')
const fs = require('fs')

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
  if (!res.ok) throw new Error(`Unexpected status: ${res.status}`)
  return unpack({ url, installPath, stream: res.body })
}

function cleanArguments (version, platform, arch, installPath) {
  const conf = pkgConf.sync('go-ipfs', {
    cwd: path.join(process.cwd(), '..'),
    defaults: {
      version: 'v' + pkg.version.replace(/-[0-9]+/, ''),
      distUrl: 'https://api.github.com'
    }
  })
  return {
    version: process.env.TARGET_VERSION || version || conf.version,
    platform: process.env.TARGET_OS || platform || goenv.GOOS,
    arch: process.env.TARGET_ARCH || arch || goenv.GOARCH,
    distUrl: process.env.GO_IPFS_DIST_URL || conf.distUrl,
    installPath: installPath ? path.resolve(installPath) : process.cwd()
  }
}

async function ensureVersion ({ version, distUrl }) {
  const res = await fetch(`${distUrl}/repos/ipfs/go-ipfs/releases`)
  if (!res.ok) throw new Error(`Unexpected status: ${res.status}`)
  const release = (await res.json()).filter(r => r.tag_name === version)[0]

  if (!release) {
    throw new Error(`Version '${version}' not available`)
  }

  return release
}

async function getDownloadURL ({ version, platform, arch, distUrl }) {
  const release = await ensureVersion({ version, distUrl })

  const res = await fetch(release.assets_url)
  if (!res.ok) throw new Error(`Unexpected status: ${res.status}`)
  const assets = await res.json()

  const assetName = `go-ipfs_${version}_${platform}-${arch}.tar.gz`
  const targetAsset = assets.filter(a => a.name === assetName)[0]
  const res2 = await fetch(targetAsset.url)
  if (!res2.ok) throw new Error(`Unexpected status: ${res.status}`)
  const asset = await res2.json()

  return asset.browser_download_url
}

module.exports = async function () {
  const args = await cleanArguments(...arguments)
  const url = await getDownloadURL(args)

  process.stdout.write(`Downloading ${url}\n`)

  await download({ ...args, url })

  return {
    fileName: url.split('/').pop(),
    installPath: path.join(args.installPath, 'go-ipfs') + path.sep
  }
}

module.exports.path = function () {
  const paths = [
    path.resolve(path.join(__dirname, '..', 'go-ipfs', 'ipfs')),
    path.resolve(path.join(__dirname, '..', 'go-ipfs', 'ipfs.exe'))
  ]

  for (const bin of paths) {
    if (fs.existsSync(bin)) {
      return bin
    }
  }

  throw new Error('go-ipfs binary not found, it may not be installed or an error may have occured during installation')
}

module.exports.path.silent = function () {
  try {
    return module.exports.path()
  } catch (err) {
    // ignore
  }
}
