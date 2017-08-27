import * as MarkdownIt from 'markdown-it';
import * as MathPlugin from 'markdown-it-texmath';
import * as KaTeX from 'katex';
import * as iterator from 'markdown-it-for-inline';
import {CheckboxPlugin} from './CheckboxPlugin';
import * as AnchorPlugin from 'markdown-it-anchor';
import * as slugify from 'slugify';
import * as TOCPlugin from 'markdown-it-table-of-contents';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import 'mermaid/dist/mermaid.forest.min.css';

const slugifyHeading = name => 'editor/' + slugify(name).toLowerCase();

export class Renderer {
    md: MarkdownIt.MarkdownIt;
    mermaidLoaded: boolean = false;
    highlightLoaded: boolean = false;

    constructor() {
        this.md = new MarkdownIt();
        this.md.use(MathPlugin.use(KaTeX));
        this.md.use(CheckboxPlugin, {
            checkboxClass: 'checkbox'
        });
        this.md.use(AnchorPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(TOCPlugin, {
            slugify: slugifyHeading
        });
        this.md.use(iterator, 'url_new_win', 'link_open', (tokens: MarkdownIt.Token[], idx: number) => {
            tokens[idx].attrPush(['target', '_blank']);
            tokens[idx].attrPush(['rel', 'noopener']);
        });
        this.md.use(iterator, 'internal_image_link', 'image', (tokens: MarkdownIt.Token[], idx: number) => {
            tokens[idx].attrSet('src', this.getUrl(tokens[idx].attrGet('src') as string));
        });
    }

    prepareText(text: string): string {
        if (text.substr(0, 3) === '+++') {
            text = text.substr(3);
            text = text.substr(text.indexOf('+++') + 3);
        }

        return text;
    }

    getUrl(path: string): string {
        if (!path) {
            return path;
        }
        if (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://' || path.substr(0, 3) === '://') {
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

    requiresMermaid(text: string): boolean {
        return text.match(/(gantt|sequenceDiagram|graph (?:TB|BT|RL|LR|TD))/) !== null;
    }

    requiresHighlight(text: string): boolean {
        return text.indexOf('```') !== -1;
    }

    renderText(text: string, element): void {
        if (this.requiresMermaid(text) && !this.mermaidLoaded) {
            this.mermaidLoaded = true;
            require.ensure(['./MermaidPlugin'], () => {
                const {MermaidPlugin} = require('./MermaidPlugin');
                this.md.use(MermaidPlugin);
                this.renderText(text, element);
            });
        }
        if (this.requiresHighlight(text) && !this.highlightLoaded) {
            this.highlightLoaded = true;
            require.ensure(['markdown-it-highlightjs'], () => {
                this.md.use(require('markdown-it-highlightjs'));
                this.renderText(text, element);
            });
        }
        const html = this.md.render(this.prepareText(text));
        element.html(html);
    }
}