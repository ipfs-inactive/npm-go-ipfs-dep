'use strict'

const test = require('tape')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const goenv = require('go-platform')
const pkg = require('./../package.json')
const Download = require('../src')

const version = process.env.TARGET_VERSION || 'v' + pkg.version.replace(/-[0-9]+/, '')

// These tests won't work with promises, wrap the download function to a callback
function download (version, platform, arch, callback) {
  if (typeof version === 'function' || !version) {
    callback = version || callback
    version = null
  }

  if (typeof platform === 'function' || !platform) {
    callback = callback || platform
    platform = null
  }

  if (typeof arch === 'function' || !arch) {
    callback = callback || arch
    arch = null
  }

  callback = callback || ((err, res) => {
    if (err) {
      throw err
    }
  })

  Download(version, platform, arch)
    .then((artifact) => callback(null, artifact))
    .catch((err) => callback(err))
}

test('Ensure ipfs gets downloaded (current version and platform)', (t) => {
  t.plan(5)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)

  download((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`ipfs_${version}_${goenv.GOOS}-${goenv.GOARCH}`) !== -1, 'Returns the correct filename')

    t.ok(res.installPath === path.resolve(__dirname, '../', 'go-ipfs') + '/', 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'go-ipfs should stat without error')
      t.ok(stats, 'go-ipfs was downloaded')
    })
  })
})

test('Ensure Windows version gets downloaded', (t) => {
  t.plan(7)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  download(version, 'windows', (err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`ipfs_${version}_windows-${goenv.GOARCH}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(__dirname, '../', 'go-ipfs') + '/', 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'go-ipfs for windows should stat without error')
      t.ok(stats, 'go-ipfs for windows was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'ipfs.exe'), (err2, stats2) => {
        t.error(err2, 'windows bin should stat without error')
        t.ok(stats2, 'windows bin was downloaded')
      })
    })
  })
})

test('Ensure Linux version gets downloaded', (t) => {
  t.plan(7)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  download(version, 'linux', (err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`ipfs_${version}_linux-${goenv.GOARCH}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(__dirname, '../', 'go-ipfs') + '/', 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'go-ipfs for linux should stat without error')
      t.ok(stats, 'go-ipfs for linux was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'ipfs'), (err2, stats2) => {
        t.error(err2, 'linux bin should stat without error')
        t.ok(stats2, 'linux bin was downloaded')
      })
    })
  })
})

test('Ensure OSX version gets downloaded', (t) => {
  t.plan(7)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  download(version, 'darwin', (err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`ipfs_${version}_darwin-${goenv.GOARCH}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(__dirname, '../', 'go-ipfs') + '/', 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'go-ipfs for OSX should stat without error')
      t.ok(stats, 'go-ipfs OSX linux was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'ipfs'), (err2, stats2) => {
        t.error(err2, 'OSX bin should stat without error')
        t.ok(stats2, 'OSX bin was downloaded')
      })
    })
  })
})

test('Ensure TARGET_OS, TARGET_VERSION and TARGET_ARCH version gets downloaded', (t) => {
  t.plan(7)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  process.env.TARGET_OS = 'windows'
  process.env.TARGET_VERSION = version

  // TODO solve this https://github.com/ipfs/distributions/issues/165
  // process.env.TARGET_ARCH = '386'
  process.env.TARGET_ARCH = 'amd64'

  download((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`ipfs_${process.env.TARGET_VERSION}_${process.env.TARGET_OS}-${process.env.TARGET_ARCH}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(__dirname, '../', 'go-ipfs') + '/', 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'go-ipfs for windows should stat without error')
      t.ok(stats, 'go-ipfs for windows was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'ipfs.exe'), (err2, stats2) => {
        t.error(err2, 'windows bin should stat without error')
        t.ok(stats2, 'windows bin was downloaded')
        delete process.env.TARGET_OS
        delete process.env.TARGET_VERSION
        delete process.env.TARGET_ARCH
      })
    })
  })
})

test('Returns an error when version unsupported', (t) => {
  t.plan(2)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  download('bogusversion', 'linux', (err, res) => {
    t.ok(err !== null, 'Throws an error')
    t.ok(err.toString() === "Error: Version 'bogusversion' not available", 'Throws the correct error message')
  })
})

test('Returns an error when dist url is 404', (t) => {
  t.plan(2)
  const dir = path.resolve(__dirname, '../go-ipfs')
  rimraf.sync(dir)
  process.env.GO_IPFS_DIST_URL = 'https://dist.ipfs.io/notfound'
  download((err, res) => {
    t.ok(err, 'Throws an error')
    t.ok(err.toString().indexOf('Error: 404') > -1, 'Throws the correct error message')
    delete process.env.GO_IPFS_DIST_URL
  })
})
