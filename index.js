'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    View,
    WebView,
    Platform,
    Dimensions,
} = ReactNative;

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource.js');
resolveAssetSource.setCustomSourceTransformer((resolver)=>{
    if (Platform.OS === 'android' && !resolver.serverUrl && !resolver.bundlePath && (resolver.asset.type === 'html'||resolver.asset.type === 'img')) {
        resolver.bundlePath = '/android_res/';
    }
    return resolver.defaultAsset();
});
const source = require('./remobile-cocos2dx.html');

module.exports = React.createClass({
    getDefaultProps() {
        const {width, height} = Dimensions.get('window');
        return {
            width,
            height,
            renderMode: 1,
            frameRate: 60,
        };
    },
    getInjectedJavaScript() {
        const {width, height, renderCocos2dx, cocos2dxParams, renderMode, frameRate} = this.props;
        return `
            var canvas = document.getElementById("canvas");
            canvas.style.height = "${height}px";
            canvas.style.width = "${width}px";
            document.ccConfig = {id: "canvas", renderMode: ${renderMode}, frameRate: ${frameRate}};
            (${renderCocos2dx.toString()})(${JSON.stringify(cocos2dxParams)});
        `;
    },
    render() {
        const {width, height} = this.props;
        const script = this.getInjectedJavaScript();
        console.log(script);
        return (
            <View style={{width, height}}>
                <WebView
                    scrollEnabled={false}
                    scalesPageToFit={true}
                    injectedJavaScript={script}
                    style={{width, height}}
                    source={source}
                    />
            </View>
        );
    }
});
