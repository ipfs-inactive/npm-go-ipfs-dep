const fs = require('fs')
const path = require('path')
const test = require('tape')
const execa = require('execa')
const rimraf = require('rimraf')

/*
  Test that go-ipfs is downloaded during npm install.
  - package up the current source code with `npm pack`
  - install the tarball into the example project
  - ensure that the "go-ipfs.version" prop in the package.json is used
*/

const testVersion = require('./fixture/example-project/package.json')['go-ipfs'].version
let tarballName = null

function packTarball () {
  const parentDir = path.join(__dirname, '..')
  const res = execa.sync('npm', ['pack', parentDir], {
    cwd: __dirname
  })
  tarballName = res.stdout
  return tarballName
}

test.onFinish(() => {
  fs.unlinkSync(path.join(__dirname, tarballName))
  rimraf.sync(path.join('fixture', 'example-project', 'node_modules'))
})

test.only('Ensure go-ipfs.version defined in parent package.json is used', (t) => {
  const tarballName = packTarball()
  // from `example-project`, install the module
  const res = execa.sync('npm', ['install', '--no-save', path.join('..', '..', tarballName)], {
    cwd: path.join(__dirname, 'fixture', 'example-project')
  })
  const msg = `Downloading https://dist.ipfs.io/go-ipfs/${testVersion}`
  t.ok(res.stdout.includes(msg), msg)
  t.end()
})
