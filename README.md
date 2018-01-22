# Webpack Asset Map Plugin

[![Build Status](https://travis-ci.org/mtscout6-team/asset-map-webpack-plugin.svg?branch=master)](https://travis-ci.org/mtscout6-team/asset-map-webpack-plugin)

Creates a json file that any server side technology can consume for asset declarations. Example output file:

``` json
{
  "assets": {
    "./smiley.jpeg": "/assets/smiley-db4f287d06928156270ca185fef0e026.jpeg",
    "./test-checklist.jpeg": "/assets/test-checklist-b3b0fe76f4485db43467876f664d1f62.jpeg"
  },
  "chunks": {
    "index": [
      "/assets/index-2c9c445686f51177cf62.js"
      "/assets/index-2c9c445686f51177cf62.css"
    ]
  }
}
```

The key is the relative path from the generated file to the image location in your source location. The value is the public url slug generated by webpack.

## Usage

For webpack 1, use version 2.x of `asset-map-webpack-plugin`; for webpack 2/3, use version 3.x.

Add to the plugins array in your webpack config:

``` javascript
import AssetMapPlugin from 'asset-map-webpack-plugin';

export default {
  ...
  plugins: [
    /**
     * AssetMapPlugin
     *
     * @param {string} outputFile - What to name the output JSON file (written to the same directory as the other webpack assets)
     * @param {string} [relativeTo] - Key assets relative to this path, otherwise defaults to be relative to webpack `path`
     */
    new AssetMapPlugin(outputFilename, relativeTo)
  ]
};
```
