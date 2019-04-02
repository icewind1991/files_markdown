import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import iterator from 'markdown-it-for-inline';
import {CheckboxPlugin} from './CheckboxPlugin';
import AnchorPlugin from 'markdown-it-anchor';
import slugify from 'slugify';
import TOCPlugin from 'markdown-it-table-of-contents';
import VideoPlugin from './VideoPlugin';
import PreamblePlugin from 'markdown-it-github-preamble';
import morphdom from 'morphdom';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

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
    return Promise.all([
        import('katex'),
        import('markdown-it-texmath'),
    ]).then(([katex, {default: texmath}]) => {
        texmath.use(katex);
        return texmath;
    });
}

function loadMermaid() {
    return import('./MermaidPlugin').then(module => module.MermaidPlugin);
}

function loadHighlight() {
    return import('markdown-it-highlightjs').then(module => module.default);
}

export class Renderer {
    md: MarkdownIt;

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

    constructor(readonly: boolean = false) {
        this.md = new MarkdownIt({
            linkify: true
        });
        this.md.use(CheckboxPlugin, {
            checkboxClass: 'checkbox',
            readonly: readonly
        });
        this.md.use(AnchorPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(TOCPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(PreamblePlugin);
        this.md.use(VideoPlugin);
        this.md.use(iterator, 'url_new_win', 'link_open', (tokens: Token[], idx: number) => {
            const href = tokens[idx].attrGet('href') as string;
            if (href[0] !== '#') {
                tokens[idx].attrPush(['target', '_blank']);
                tokens[idx].attrPush(['rel', 'noopener']);
            }
            tokens[idx].attrSet('href', this.getLinkUrl(href))
        });
        this.md.use(iterator, 'internal_image_link', 'image', (tokens: Token[], idx: number) => {
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

    renderText(text: string, element): Promise<void> {
        return this.loadPlugins(text).then(() => {
                const html = this.md.render(text);
                morphdom(element[0], `<div>${html}</div>`, {
                    childrenOnly: true
                });
            }
        );
    }

    loadPlugins(text: string) {
        return Promise.all(Object.keys(this.plugins)
            .map(pluginName => {
                const plugin = this.plugins[pluginName];
                if (!plugin.loaded && plugin.checker(text)) {
                    plugin.loaded = true;
                    return plugin.module().then(plugin => {
                        this.md.use(plugin);
                    });
                }
            })
        );
    }
}
