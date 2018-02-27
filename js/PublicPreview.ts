import {Renderer} from "./Renderer";

export class PublicPreview {
    private renderer: Renderer;

    private initPromise: JQueryPromise<void> | null = null;

    init() {
        if (!this.initPromise) {
            const deferred = $.Deferred();
            require.ensure(['./Renderer'], () => {
                const {Renderer} = require('./Renderer');
                this.renderer = new Renderer(true);
                deferred.resolve();
            });
            this.initPromise = deferred.promise();
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
