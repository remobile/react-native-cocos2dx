# React Native Cocos2dx (remobile)
A react-native wrapper cocos2dx html5

## Installation
```sh
npm install @remobile/react-native-cocos2dx --save
```

## Usage

### Example
```js
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
} = ReactNative;

var resolveAssetSource = require('resolveAssetSource');
var Cocos2dx = require('@remobile/react-native-cocos2dx');

module.exports = React.createClass({
    renderCocos2dx() {
        return (res, transProps)=> {
            cc.game.onStart = function(){
                var MyScene = cc.Scene.extend({
                    alert(transProps.text);
                    onEnter:function () {
                        this._super();
                        var size = cc.director.getWinSize();

                        var sprite = cc.Sprite.create(res.img.qq);
                        sprite.setPosition(size.width / 2, size.height / 2 - 200);
                        sprite.setScale(0.8);
                        this.addChild(sprite, 0);

                        var sprite = cc.Sprite.create(res.img.weixin);
                        sprite.setPosition(size.width / 2, size.height / 2);
                        sprite.setScale(0.8);
                        this.addChild(sprite, 0);

                        var label = cc.LabelTTF.create("Hello World", "Arial", 40);
                        label.setPosition(size.width / 2, size.height / 2 + 200);
                        label.setColor(255, 0,255);
                        this.addChild(label, 1);
                    }
                });
                cc.director.runScene(new MyScene());
            };
            cc.game.run();
        }
    },
    render () {
        const resource = {
            img: {
                qq: resolveAssetSource(require('./img/qq.img')).uri,
                weixin: resolveAssetSource(require('./img/weixin.img')).uri,
            }
        };
        return (
            <View style={styles.container}>
                <Cocos2dx
                    render={this.renderCocos2dx()}
                    resource={resource}
                    transProps={{text: 'I am from react-native'}}
                    width={sr.tw}
                    height={sr.tch}
                    />
            </View>
        );
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
});
```

## Screencasts

![demo](https://github.com/remobile/react-native-cocos2dx/blob/master/screencasts/demo.png)
![demo](https://github.com/remobile/react-native-cocos2dx/blob/master/screencasts/demo.gif)

#### Props
- `width: PropTypes.number` canvas width
- `height: PropTypes.number` canvas height
- `showFPS: PropTypes.boolean` default: false
- `frameRate: PropTypes.number` default: 60
- `renderMode: PropTypes.number` {0: `default`, 1: `canvas`, 2: `webgl`} default is 1: `canvas`
- `resource: PropTypes.object` must be `resolveAssetSource(require('xx.png')).uri`
- `transProps: PropTypes.any` pass props from react-native to cocos2dx
- `render: PropTypes.function` the main logic funciton of cocos2dx
    * it return a nickname funciton like: `(res, transProps)=> {...}`
    * res android params in cocos2dx code is global variables
- `onCocos2dxMessage: PropTypes.function` params is data passed from cocos2dx code
    * in cocos2dx code, we add a method `cc.sendMessage(data)` for cc

## Develop with project
##### mkdir for cocos2dx code and resource
* cocos2dx code directory must be <span style="color:red;font-size:30px;">remobile-cocos2dx-render</span>
* cocos2dx resource directory must be <span style="color:red;font-size:30px;">remobile-cocos2dx-resource</span>
* see [example](https://github.com/remobile/react-native-template/blob/master/project/App/modules/remobile/react-native-cocos2dx)

##### add command
* add package.json script like:
```js
    "scripts": {
        "genres": "genccresource modules/remobile/react-native-cocos2dx/remobile-cocos2dx-resource modules/remobile/react-native-cocos2dx/remobile_cocos2dx_resource.js",
        "genrender": "genccrender modules/remobile/react-native-cocos2dx/remobile-cocos2dx-render modules/remobile/react-native-cocos2dx/remobile_cocos2dx_render.js",
        "genrender:dev": "npm run genrender dev"
    }
```
* `genccresource` sourceDir targetFile
* `genccrender` sourceDir targetFile
* run `npm run genres`, will create a tmp file `modules/remobile/react-native-cocos2dx/remobile_cocos2dx_resource.js`, you will keep it ignore for git.
* run `npm run genrender`, will create a tmp file `modules/remobile/react-native-cocos2dx/remobile_cocos2dx_render.js`, you will keep it ignore for git.
* we will require `remobile_cocos2dx_resource.js` and `remobile_cocos2dx_render.js` for render and resource

## Fix ReactNative Packer
* In android release version, we need packer cocos2dx resource files in res/raw folder
* modify `node_modules/react-native/local-cli/bundle/assetPathUtils.js:30`
```js
...
30:  const androidFolder = 'drawable-' + suffix; // <------ replace here
31:  return androidFolder;
...
35   var folderPath = getBasePath(asset);
36   return (folderPath + '/' + asset.name) // <------ replace here
37     .toLowerCase()  
```
replace with
```js
...
30:  const isImage = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].indexOf(asset.type) !== -1; // <------ add
31:  const isCocos2dxResource =  asset.httpServerLocation.split('/').indexOf('remobile-cocos2dx-resource') !== -1; // <------ add
32:  const androidFolder = isImage && !isCocos2dxResource ? 'drawable-' + suffix : 'raw'; // <------ add
33:  return androidFolder;
...
37   var folderPath = getBasePath(asset);
38   return (folderPath + '/' + asset.name + '_' + asset.type) // <------ add
39     .toLowerCase()  
```

## react-native-fs notice
* first see issue: https://github.com/johanneslumpe/react-native-fs/pull/270/commits/f6de89542da532009a1b9ec2d6e3658458149d35
* use https://github.com/remobile/react-native-fs
