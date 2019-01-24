export declare class SidebarPreview implements SidebarPreviewPlugin {
    private renderer;
    private initPromise;
    init(): JQueryPromise<void>;
    attach(manager: any): void;
    handlePreview: SidebarPreviewRender;
    getFileContent(path: string): JQuery.jqXHR<any>;
}
