/// <reference types="jquery" />
import { PreviewPlugin } from "./PreviewPlugin";
export declare class SidebarPreview implements SidebarPreviewPlugin {
    private previewPlugin;
    constructor(previewPlugin: PreviewPlugin);
    attach(manager: any): void;
    handlePreview: SidebarPreviewRender;
    getFileContent(path: string): JQuery.jqXHR<any>;
}
