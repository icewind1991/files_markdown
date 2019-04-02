import {Renderer} from "./Renderer";

export class PublicPreview {
    private renderer: Renderer;

    private initPromise: Promise<void> | null = null;

    init() {
        if (!this.initPromise) {
            this.initPromise = import('./Renderer').then(({Renderer}) => {
                this.renderer = new Renderer(true);
            });
        }
        return this.initPromise;
    }

    attach(previewElement: JQuery, shareToken: string) {
        previewElement
            .addClass('icon-loading')
            .children().remove();

        $.when(
            this.getFileContent(shareToken),
            this.init()
        ).then(([content]) => {
            previewElement
                .removeClass('icon-loading');

            this.renderer.renderText(content, previewElement);
        });
    }

    getFileContent(shareToken: string) {
        const url = OC.generateUrl('/s/{token}/download', {token: shareToken});
        return $.get(url);
    }
}
