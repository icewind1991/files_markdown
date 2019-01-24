export declare type PasteListener = (image: HTMLImageElement, file: File) => void;
export declare class PasteImage {
    private initialized;
    private listeners;
    private listenForPaste;
    private init;
    private pasteHandler;
    private getURLObj;
    private createImage;
    listen(handler: PasteListener): void;
}
