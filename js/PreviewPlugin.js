"use strict";
exports.__esModule = true;
var Renderer_1 = require("./Renderer");
var PreviewPlugin = (function () {
    function PreviewPlugin() {
        this.renderer = new Renderer_1.Renderer();
        this.preview = _.throttle(this.renderer.renderText.bind(this.renderer), 500);
    }
    return PreviewPlugin;
}());
exports.PreviewPlugin = PreviewPlugin;
