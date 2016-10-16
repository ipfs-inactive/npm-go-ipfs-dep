'use strict'

module.exports = {
  isSupportedArchitecture: function (arch) {
    switch (arch) {
      case 'amd64':
      case '386':
      case 'arm':
        return true
      default:
        return false
    }
  },
  isWindows: function (os) {
    if (os === 'windows') {
      return true
    }

    return false
  }
}
