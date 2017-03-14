'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    View,
    WebView,
    Platform,
    Dimensions,
} = ReactNative;

const source = Platform.OS==='android' ? { uri: 'file:///android_asset/remobile-cocos2dx.html' } : require('./remobile-cocos2dx.html');

var Cocos2dx = React.createClass({
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
        const {width, height, renderCocos2dx, renderMode, frameRate} = this.props;
        return `
            var canvas = document.getElementById("canvas");
            canvas.style.height = "${height}px";
            canvas.style.width = "${width}px";
            document.ccConfig = {id: "canvas", renderMode: ${renderMode}, frameRate: ${frameRate}};
            (${renderCocos2dx.toString()})();
        `;
    },
    render() {
        const {width, height} = this.props;
        const script = this.getInjectedJavaScript();
        return (
            <View style={{width, height}}>
                <WebView
                    scrollEnabled={false}
                    scalesPageToFit={false}
                    underlayColor={'transparent'}
                    injectedJavaScript={script}
                    style={{width, height}}
                    source={source}
                    />
            </View>
        );
    }
});

module.exports = Cocos2dx;
