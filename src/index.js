'use strict'

var checkPlatform = require('./checkPlatform')
var goenv = require('go-platform')
var gunzip = require('gunzip-maybe')
var path = require('path')
var request = require('request')
var tarFS = require('tar-fs')
var unzip = require('unzip')
var version = require('./../package.json').version

module.exports = function (callback) {
  callback = callback || noop

  // make sure we can do this.
  if (!checkPlatform.isSupportedArchitecture(goenv.GOARCH)) {
    throw new Error('no binary available for arch: ' + goenv.GOARCH)
  }

  const isWindows = checkPlatform.isWindows(goenv.GOOS)

  // hacky hack hack to work around unpublishability
  version = version.replace(/-[0-9]+/, '')

  const fileExtension = isWindows ? '.zip' : '.tar.gz'
  const fileName = 'ipfs_v' + version + '_' + goenv.GOOS + '-' + goenv.GOARCH + fileExtension
  const url = 'http://dist.ipfs.io/go-ipfs/v' + version + '/go-' + fileName
  const installPath = path.resolve(__dirname, '..')
  const fileStream = request.get(url)

  if (isWindows) {
    fileStream.pipe(
      unzip.Extract({ path: installPath })
      .on('close', callback))
  } else {
    fileStream.pipe(gunzip())
    .pipe(
      tarFS
        .extract(installPath)
        .on('finish', callback)
    )
  }
}

function noop () {}
