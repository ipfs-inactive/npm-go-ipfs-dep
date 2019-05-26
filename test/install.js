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

const testVersion = 'v0.4.21-rc3'
let tarballName = null

function packTarball () {
  try {
    const parentDir = path.join(__dirname, '..')
    const res = execa.sync('npm', ['pack', parentDir], {
      cwd: __dirname
    })
    tarballName = res.stdout
    return tarballName
  } catch (err) {
    console.error(err)
  }
}

test.onFinish(() => {
  fs.unlinkSync(path.join(__dirname, tarballName))
})

test('Ensure go-ipfs.version defined in parent package.json is used', async (t) => {
  rimraf.sync(path.join('fixture', 'example-project', 'node_modules'))
  const tarballName = packTarball()
  // from `example-project`, install the module
  const res = execa.sync('npm', ['install', '--no-save', path.join('..', '..', tarballName)], {
    cwd: path.join(__dirname, 'fixture', 'example-project')
  })
  t.ok(res.stdout.includes(`Downloading https://dist.ipfs.io/go-ipfs/${testVersion}`))
  t.end()
})
