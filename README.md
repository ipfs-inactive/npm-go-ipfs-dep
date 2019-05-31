# go-ipfs-dep

> Download [go-ipfs](https://github.com/ipfs/go-ipfs/) to your node_modules.

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://flat.badgen.net/travis/ipfs/npm-go-ipfs-dep)](https://travis-ci.com/ipfs/npm-go-ipfs-dep)
[![Dependency Status](https://david-dm.org/ipfs/npm-go-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/npm-go-ipfs)


# Installation

```
npm install go-ipfs-dep --save
```

See [IPFS getting-started](http://ipfs.io/docs/getting-started). If anything goes wrong, try using: [http://ipfs.io/docs/install](http://ipfs.io/docs/install).

## Usage

This module downloads `go-ipfs` binaries from https://dist.ipfs.io into your project.

By default it will download the go-ipfs version that matches the npm version of this module. So depending on `go-ipfs-dep@0.4.19` will install `go-ipfs v0.4.19` for your current system architecture, in to your project at `node_modules/go-ipfs-dep/go-ipfs/ipfs`.

### Overriding the go-ipfs version

You can override the version of go-ipfs that gets downloaded by adding by adding a `go-ipfs.version` field to your `package.json`

```json
"go-ipfs": {
  "version": "v0.4.13"
},
```

### Using local IPFS daemon as the package download url

The url to download the binaries from can be specified by adding a field `go-ipfs.distUrl` field to your `package.json`, eg:

```json
"go-ipfs": {
  "version": "v0.4.3",
  "distUrl": "http://localhost:8080/ipfs/QmSoNtqW22htkg9mtHWNBvZLUEmqfq8su7957meS1iQfeL"
},
```

Where `QmSoNtqW22htkg9mtHWNBvZLUEmqfq8su7957meS1iQfeL` is the root of the distributions web site.

Or when run with `node src/bin.js`, the dist url can be passed via an environment variable `GO_IPFS_DIST_URL`, eg:

```
GO_IPFS_DIST_URL=http://localhost:8080/ipfs/QmSoNtqW22htkg9mtHWNBvZLUEmqfq8su7957meS1iQfeL node binsrc/bin.js
```

### Arguments

When used via `node src/bin.js`, you can specify the target platform, version and architecture via environment variables: `TARGET_OS`, `TARGET_VERSION` and `TARGET_ARCH`.

We fetch the versions dynamically from `https://dist.ipfs.io/go-ipfs/versions` and the OSes and architectures from `https://dist.ipfs.io/go-ipfs/${VERSION}/dist.json`.

Or via command line arguments in the order of:

```
node src/bin.js <version> <platform> <architecture> <install directory>
```

```
node src/bin.js v0.4.3 linux amd64 ./go-ipfs
```

## Development

**Note**: The binary gets put in the `go-ipfs` folder inside the module folder.

## Deployment

### Prerelease

You have made changes and want to triple check everything is working. You can! If you publish with a numeric prerelease identifier then `go-ipfs-dep` will strip it and install the corresponding version e.g. `0.4.19-0` installs `go-ipfs` version `0.4.19`.

To deploy a new version with a prerelease identifier run the following command:

```sh
npx aegir release --type prepatch --preid '' --dist-tag next --no-lint --no-test --no-build
# Note: change "--type prepatch" to the appropriate prerelease type.
# e.g. prepatch: 0.4.18 => 0.4.19-0, preminor: 0.4.18 => 0.5.0-0 etc.

# Increment prerelease (e.g. 0.4.19-0 -> 0.4.19-1)
npx aegir release --type prerelease --preid '' --dist-tag next --no-lint --no-test --no-build
```

This publishes to the "next" tag meaning that the current "latest" version of `go-ipfs-dep` will remain the same.

When you're finally ready to release:

```sh
npx aegir release --type=patch --no-lint --no-test --no-build
```
