'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    View,
    Platform,
    Dimensions,
} = ReactNative;

var WebView = require('react-native-webview-bridge');
var fs = require('react-native-fs');
const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource.js');
resolveAssetSource.setCustomSourceTransformer((resolver)=>{
    if (Platform.OS === 'android' && !resolver.serverUrl && !resolver.bundlePath && (resolver.asset.type === 'html'||resolver.asset.httpServerLocation.split('/').indexOf('remobile-cocos2dx-resource') !== -1)) {
        resolver.bundlePath = '/android_res/';
    }
    return resolver.defaultAsset();
});
const source = require('./remobile-cocos2dx.html');

module.exports = React.createClass({
    getDefaultProps() {
        const {width, height} = Dimensions.get('window');
        return {
            width: Platform.OS === 'android' ? width+1 : width,
            height,
            renderMode: 1,
            frameRate: 60,
            showFPS: false,
            transProps: {},
            resource: {},
        };
    },
    sendToBridgeText(obj, text) {
        text = text.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/'/g, '\\\'');
        this.webview.sendToBridge(JSON.stringify({type: 'RCTXMLHttpResponse', text, id: obj.id}));
    },
    onBridgeMessage(msg) {
        let obj = {};
        try { obj = JSON.parse(msg) } catch (e) {}
        if (obj.type === 'RCTXMLHttpRequest') {
            let url = obj.url;
            if (/^http:\/\/|^https:\/\//.test(url)) {
                fetch(url, {method: 'get'})
                .then((res) => res.text())
                .then(this.sendToBridgeText.bind(null, obj));
            } else {
                const extname = url.replace(/.*\.(.*)/, '$1');
                if (Platform.OS==='android' && /^file:\/\/\/android_res/.test(url)) {
                    const filename = url.replace(/.*\/(.*)\..*/, '$1');
                    fs.readFileRaw(filename, 'utf8').then(this.sendToBridgeText.bind(null, obj));
                } else {
                    fs.readFile(url, 'utf8').then(this.sendToBridgeText.bind(null, obj));
                }
            }
        } else if (obj.type === 'RCTCocos2dxMessage') {
            this.props.onCocos2dxMessage && this.props.onCocos2dxMessage(obj.data);
        }
    },
    getInjectedJavaScript() {
        const {width, height, render, resource, transProps, renderMode, frameRate, showFPS} = this.props;
        return `
        var canvas = document.getElementById("canvas");
        canvas.width = ${width};
        canvas.height = ${height};
        window.XMLHttpRequest = function RCTXMLHttpRequest()  {
            RCTXMLHttpRequest.prototype.open = function(type, url) {
                this.url = url;
                this.readyState = 4;
                this._id = RCTXMLHttpRequest.__id||0;
                RCTXMLHttpRequest.__id = this._id+1;
                RCTXMLHttpRequest.requests = RCTXMLHttpRequest.requests||{};
                RCTXMLHttpRequest.requests[this._id] = this;
            };
            RCTXMLHttpRequest.prototype.onMessage = function(obj) {
                this.status = 200;
                this.responseText = obj.text;
                this.response = obj.binary;
                this.onload && this.onload();
                RCTXMLHttpRequest.requests[this._id] = null;
            };
            RCTXMLHttpRequest.prototype.send = function() {
                WebViewBridge.send(JSON.stringify({type: 'RCTXMLHttpRequest', id: this._id, url: this.url}));
            };
        };
        WebViewBridge.onMessage = function(msg){
            var obj = {};
            try { obj = JSON.parse(msg) } catch (e) {}
            if (obj.type === 'RCTXMLHttpResponse') {
                if (XMLHttpRequest.requests[obj.id]) {
                    XMLHttpRequest.requests[obj.id].onMessage(obj);
                }
            }
        };
        document.ccConfig = {id: "canvas", debugMode:1, renderMode: ${renderMode}, frameRate: ${frameRate}, showFPS: ${showFPS}};
        cc.sendMessage = function(data){
            WebViewBridge.send(JSON.stringify({type: 'RCTCocos2dxMessage', data: data}));
        };
        cc.game.onStart = function(){
            (${render.toString()})(${JSON.stringify(resource)}, ${JSON.stringify({...transProps, width, height})});
        };
        cc.game.run();
        `;
    },
    render() {
        const {width, height} = this.props;
        const script = this.getInjectedJavaScript();
        return (
            <View style={{width, height}}>
                <WebView
                    ref={(ref)=>{this.webview=ref}}
                    scrollEnabled={false}
                    scalesPageToFit={Platform.OS === 'android'}
                    injectedJavaScript={script}
                    onBridgeMessage={this.onBridgeMessage}
                    style={{width, height}}
                    source={source}
                    />
            </View>
        );
    }
});
