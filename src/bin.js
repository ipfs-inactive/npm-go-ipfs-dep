#!/usr/bin/env node

'use strict'

// First param is the target version
// Second param is the target platform
// Third param is the target architecture
require('./')
  .Download(process.argv[2], process.argv[3], process.argv[4])
  .then(() => process.exit(0))
  .catch((e) => process.exit(1))
