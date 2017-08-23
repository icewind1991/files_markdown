/// <reference types="marked" />
declare module "Renderer" {
    import * as marked from 'marked';
    import './Nextcloud';
    export class Renderer {
        renderer: marked.Renderer;
        constructor();
        prepareText(text: string): string;
        getUrl(path: string): string;
        renderText(text: string, element: any): void;
    }
}
declare module "PreviewPlugin" {
    import { Renderer } from "Renderer";
    export class PreviewPlugin {
        renderer: Renderer;
        preview: any;
    }
}
declare module "editor" {
}
