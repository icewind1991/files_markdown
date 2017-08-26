/// <reference types="markdown-it" />
import * as MarkdownIt from 'markdown-it';
export declare class Renderer {
    md: MarkdownIt.MarkdownIt;
    constructor();
    prepareText(text: string): string;
    getUrl(path: string): string;
    renderText(text: string, element: any): void;
}
