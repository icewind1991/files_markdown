import {Renderer} from "./Renderer";

export class SidebarPreview implements SidebarPreviewPlugin {
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

    attach(manager) {
        manager.addPreviewHandler('text/markdown', this.handlePreview);
    }

    handlePreview: SidebarPreviewRender = (model, $thumbnailDiv, $thumbnailContainer, fallback) => {
        const previewWidth = ($thumbnailContainer.parent().width() as number) + 50;  // 50px for negative margins
        const previewHeight = previewWidth / (16 / 9);

        $.when(
            this.getFileContent(model.getFullPath()),
            this.init()
        ).then(([content]) => {
            $thumbnailDiv.removeClass('icon-loading icon-32');
            $thumbnailContainer.addClass('large');
            $thumbnailContainer.addClass('text');
            const $textPreview = $('<div id="preview" class="text-markdown"/>');
            this.renderer.renderText(content, $textPreview);
            $thumbnailDiv.children('.stretcher').remove();
            $thumbnailDiv.append($textPreview);
            $thumbnailContainer.css("max-height", previewHeight);
        }, function () {
            fallback();
        });
    };

    getFileContent(path: string) {
        const url = OC.linkToRemoteBase('files' + path);
        return $.get(url);
    }
}
