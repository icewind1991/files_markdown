"use strict";
exports.__esModule = true;
var marked = require("marked");
var hljs = require("highlight.js");
require("./Nextcloud");
var Renderer = (function () {
    function Renderer() {
        var _this = this;
        this.renderer = new marked.Renderer();
        var linkRenderer = this.renderer.link.bind(this.renderer);
        this.renderer.image = function (href, title, text) {
            var out = '<img src="' + _this.getUrl(href) + '" alt="' + text + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += '>';
            return out;
        };
        this.renderer.link = function (href, title, text) {
            var rendered = linkRenderer(href, title, text);
            var parser = document.createElement('a');
            parser.href = href;
            if (parser.hostname !== window.location.hostname) {
                return rendered.replace("href=", "target='_blank' rel='noopener' href=");
            }
            else {
                return rendered;
            }
        };
        this.renderer.code = function (code, language) {
            if (code.match(/^sequenceDiagram/) || code.match(/^graph/) || code.match(/^gantt/)) {
                return '<div class="mermaid">' + code + '</div>';
            }
            else {
                // Check whether the given language is valid for highlight.js.
                var validLang = !!(language && hljs.getLanguage(language));
                // Highlight only if the language is valid.
                var highlighted = validLang ? hljs.highlight(language, code).value : code;
                // Render the highlighted code with `hljs` class.
                return '<pre><code class="hljs ' + language + '">' + highlighted + '</code></pre>';
            }
        };
        marked.setOptions({
            renderer: this.renderer,
            headerPrefix: 'md-'
        });
    }
    Renderer.prototype.prepareText = function (text) {
        if (text.substr(0, 3) === '+++') {
            text = text.substr(3);
            text = text.substr(text.indexOf('+++') + 3);
        }
        return text;
    };
    Renderer.prototype.getUrl = function (path) {
        if (!path) {
            return path;
        }
        if (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://' || path.substr(0, 3) === '://') {
            return path;
        }
        else {
            if (path.substr(0, 1) !== '/') {
                if (OCA.Files_Texteditor.file && OCA.Files_Texteditor.file.dir) {
                    path = OCA.Files_Texteditor.file.dir + '/' + path;
                }
                else if (OCA.Files.App && OCA.Files.App.fileList._currentDirectory) {
                    path = OCA.Files.App.fileList._currentDirectory + '/' + path;
                }
            }
            return OC.linkToRemote('files' + path.replace(/\/\/+/g, '/'));
        }
    };
    Renderer.prototype.renderText = function (text, element) {
        var html = marked(this.prepareText(text));
        element.html(html);
        // renderMathInElement(element.get(0), {
        //     delimiters: [
        //         {left: "$$", right: "$$", display: true},
        //         {left: "$", right: "$", display: false}
        //     ]
        // });
        // mermaid.init();
    };
    return Renderer;
}());
exports.Renderer = Renderer;
