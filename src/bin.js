#!/usr/bin/env node

'use strict'

const download = require('./')

const error = (err) => {
  process.stdout.write(`${err}\n`)
  process.stdout.write(`Download failed!\n\n`)
  process.exit(1)
}

const success = (output) => {
  process.stdout.write(`Downloaded ${output.fileName}\n`)
  process.stdout.write(`Installed go-${output.fileName.replace('.tar.gz', '').replace('.zip', '').replace(/_/g, ' ')} to ${output.installPath}\n`)
  process.exit(0)
}

// First param is the target version
// Second param is the target platform
// Third param is the target architecture
download(process.argv[2], process.argv[3], process.argv[4])
  .then(success)
  .catch(error)
