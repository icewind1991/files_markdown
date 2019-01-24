import MarkdownIt from 'markdown-it';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import Thenable = JQuery.Thenable;
export declare type PluginChecker = (text: string) => boolean;
export interface PluginMap {
    [name: string]: {
        checker: PluginChecker;
        module: () => Promise<any>;
        loaded?: boolean;
    };
}
export declare class Renderer {
    md: MarkdownIt;
    plugins: PluginMap;
    constructor(readonly?: boolean);
    getLinkUrl(path: string): string;
    getImageUrl(path: string): string;
    renderText(text: string, element: any): Thenable<void>;
    loadPlugins(text: string): any;
}
