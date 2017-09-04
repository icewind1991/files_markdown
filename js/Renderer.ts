import * as MarkdownIt from 'markdown-it';
import * as iterator from 'markdown-it-for-inline';
import {CheckboxPlugin} from './CheckboxPlugin';
import * as AnchorPlugin from 'markdown-it-anchor';
import * as slugify from 'slugify';
import * as TOCPlugin from 'markdown-it-table-of-contents';
import VideoPlugin from './VideoPlugin';
import * as PreamblePlugin from 'markdown-it-github-preamble';
import * as morphdom from 'morphdom';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import 'mermaid/dist/mermaid.forest.min.css';
import Thenable = JQuery.Thenable;

const slugifyHeading = name => 'editor/' + slugify(name).toLowerCase();

export type PluginChecker = (text: string) => boolean;

export interface PluginMap {
    [name: string]: {
        checker: PluginChecker;
        module: () => Promise<any>;
        loaded?: boolean
    }
}

function loadKaTeX() {
    const deferred = $.Deferred();
    require.ensure([
        'katex',
        'markdown-it-texmath'
    ], () => {
        deferred.resolve(require('markdown-it-texmath').use(require('katex')));
    }, 'katex');
    return deferred.promise();
}

function loadMermaid() {
    const deferred = $.Deferred();
    require.ensure([
        './MermaidPlugin'
    ], () => {
        deferred.resolve(require('./MermaidPlugin').MermaidPlugin);
    }, 'mermaid');
    return deferred.promise();
}

function loadHighlight() {
    const deferred = $.Deferred();
    require.ensure([
        'markdown-it-highlightjs'
    ], () => {
        deferred.resolve(require('markdown-it-highlightjs'));
    }, 'highlight');
    return deferred.promise();
}

export class Renderer {
    md: MarkdownIt.MarkdownIt;

    plugins: PluginMap = {
        'mermaid': {
            checker: text => text.match(/(gantt|sequenceDiagram|graph (?:TB|BT|RL|LR|TD))/) !== null,
            module: loadMermaid
        },
        'highlight.js': {
            checker: text => text.indexOf('```') !== -1,
            module: loadHighlight
        },
        'katex': {
            checker: text => text.indexOf('$') !== -1,
            module: loadKaTeX
        }
    };

    constructor() {
        this.md = new MarkdownIt();
        this.md.use(CheckboxPlugin, {
            checkboxClass: 'checkbox',
            readonly: false
        });
        this.md.use(AnchorPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(TOCPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(PreamblePlugin);
        this.md.use(VideoPlugin);
        this.md.use(iterator, 'url_new_win', 'link_open', (tokens: MarkdownIt.Token[], idx: number) => {
            const href = tokens[idx].attrGet('href') as string;
            if (href[0] !== '#') {
                tokens[idx].attrPush(['target', '_blank']);
                tokens[idx].attrPush(['rel', 'noopener']);
            }
            tokens[idx].attrSet('href', this.getLinkUrl(href))
        });
        this.md.use(iterator, 'internal_image_link', 'image', (tokens: MarkdownIt.Token[], idx: number) => {
            tokens[idx].attrSet('src', this.getImageUrl(tokens[idx].attrGet('src') as string));
        });

        function injectLineNumbers(tokens, idx, options, env, slf) {
            if (tokens[idx].map && tokens[idx].level === 0) {
                const line = tokens[idx].map[0];
                tokens[idx].attrJoin('class', 'line');
                tokens[idx].attrSet('data-line', String(line));
            }
            return slf.renderToken(tokens, idx, options, env, slf);
        }

        this.md.renderer.rules.paragraph_open =
            this.md.renderer.rules.heading_open =
                this.md.renderer.rules.heading_open =
                    injectLineNumbers;
    }

    getLinkUrl(path: string): string {
        if (path[0] === '#') {
            return '#' + slugifyHeading(path.substr(1));
        }
        return path;
    }

    getImageUrl(path: string): string {
        if (!path || path.indexOf('.') === -1) {
            return path;
        }
        if (path.indexOf('://') !== -1) {
            return path;
        } else {
            if (path.substr(0, 1) !== '/') {
                if (OCA.Files_Texteditor.file && OCA.Files_Texteditor.file.dir) {
                    path = OCA.Files_Texteditor.file.dir + '/' + path;
                } else if (OCA.Files.App && OCA.Files.App.fileList._currentDirectory) {
                    path = OCA.Files.App.fileList._currentDirectory + '/' + path;
                }
            }
            return OC.linkToRemote('files' + path.replace(/\/\/+/g, '/'));
        }
    }

    renderText(text: string, element): Thenable<void> {
        return this.loadPlugins(text).then(() => {
                const html = this.md.render(text);
                morphdom(element[0], `<div>${html}</div>`, {
                    childrenOnly: true
                });
            }
        );
    }

    loadPlugins(text: string) {
        return $.when.apply($, Object.keys(this.plugins)
            .map(pluginName => {
                const plugin = this.plugins[pluginName];
                if (!plugin.loaded && plugin.checker(text)) {
                    plugin.loaded = true;
                    return plugin.module().then(this.md.use.bind(this.md));
                }
            })
        );
    }
}
