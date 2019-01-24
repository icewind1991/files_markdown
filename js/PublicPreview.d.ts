export declare class PublicPreview {
    private renderer;
    private initPromise;
    init(): JQueryPromise<void>;
    attach(previewElement: JQuery, shareToken: string): void;
    getFileContent(shareToken: string): JQuery.jqXHR<any>;
}
