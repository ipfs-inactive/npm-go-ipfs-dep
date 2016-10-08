'use strict'

var fs = require('fs')
var goenv = require('go-platform')
var gunzip = require('gunzip-maybe')
var path = require('path')
var request = require('request')
var tarFS = require('tar-fs')
var unzip = require('unzip')
var version = require('./../package.json').version

module.exports = function (callback) {
  callback = callback || noop

  var fileName, fileExtension, url, installPath, isUnixy

  checkPlatform(goenv) // make sure we can do this.

  // hacky hack hack to work around unpublishability
  version = version.replace(/-[0-9]+/, '')

  isUnixy ? fileExtension = '.tar.gz' : fileExtension = '.zip'

  fileName = 'ipfs_v' + version + '_' + goenv.GOOS + '-' + goenv.GOARCH + fileExtension
  url = 'http://dist.ipfs.io/go-ipfs/v' + version + '/go-' + fileName

  installPath = path.resolve(__dirname, '..')

  if (isUnixy) {
    request
    .get(url)
    .pipe(gunzip())
    .pipe(
      tarFS
        .extract(installPath)
        .on('finish', callback)
    )
  } else {
    request
    .get(url)
    .pipe(
      unzip.Extract({ path: installPath })
      .on('close', callback))
  }

  function checkPlatform (goenv) {
    switch (goenv.GOOS) {
      case 'darwin':
      case 'linux':
      case 'freebsd':
        isUnixy = true
        break
      case 'windows':
        isUnixy = false
        break
      default:
        throw new Error('no binary available for os:' + goenv.GOOS)
    }

    switch (goenv.GOARCH) {
      case 'amd64':
      case '386':
      case 'arm':
        break

      default:
        throw new Error('no binary available for arch: ' + goenv.GOARCH)
    }
  }
}

function noop () {}
