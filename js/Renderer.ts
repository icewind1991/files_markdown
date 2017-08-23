import * as MarkdownIt from 'markdown-it';
import * as KaTeXPlugin from 'markdown-it-katex';
import * as HighlightPlugin from 'markdown-it-highlightjs';
import {MermaidPlugin} from './MermaidPlugin'
import * as iterator from 'markdown-it-for-inline';

OC.addStyle('files_markdown', '../js/node_modules/katex/dist/katex.min');
OC.addStyle('files_markdown', '../js/node_modules/highlight.js/styles/github');
// OC.addStyle('files_markdown', '../js/node_modules/mermaid/dist/mermaid.min');
OC.addStyle('files_markdown', '../js/node_modules/mermaid/dist/mermaid.forest.min');

export class Renderer {
    md: MarkdownIt.MarkdownIt;

    constructor() {
        this.md = new MarkdownIt();
        this.md.use(KaTeXPlugin);
        this.md.use(HighlightPlugin);
        this.md.use(MermaidPlugin);
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

    renderText(text: string, element): void {
        const html = this.md.render(this.prepareText(text));
        element.html(html);
    }
}