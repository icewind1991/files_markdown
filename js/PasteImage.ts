// from https://github.com/redgeoff/paste-image

// This code is heavily based on Joel Basada's great work at
// http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/

export type PasteListener = (image: HTMLImageElement, file: File) => void;

export class PasteImage {
    private initialized: boolean = false;
    private listeners: PasteListener[] = [];

    private listenForPaste() {
        window.addEventListener('paste', e => {
            this.pasteHandler(e);
        });
    }

    private init() {
        if (this.initialized) {
            return;
        }
        this.listenForPaste();
        this.initialized = true;
    }

    private pasteHandler(e) {
        if (e.clipboardData && e.clipboardData.items) {
            // Get the items from the clipboard
            const items = e.clipboardData.items;

            // Loop through all items, looking for any kind of image
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.includes('image')) {
                    const blob = items[i].getAsFile();

                    const URLObj = this.getURLObj();
                    const source = URLObj.createObjectURL(blob);

                    // The URL can then be used as the source of an image
                    this.createImage(source, blob);
                }
            }
        }
    }

    private getURLObj() {
        return window.URL || window['webkitURL'];
    }

    // Creates a new image from a given source
    private createImage(source: string, file: File) {
        const pastedImage = new Image();

        pastedImage.onload = () => {
            for (const listener of this.listeners) {
                listener(pastedImage, file);
            }
        };
        pastedImage.src = source;
    }

    public listen(handler: PasteListener) {
        this.init();
        this.listeners.push(handler);
    }
}
