import {PreviewPlugin} from "./PreviewPlugin";

export class SidebarPreview implements SidebarPreviewPlugin {
    private previewPlugin: PreviewPlugin;

    constructor(previewPlugin: PreviewPlugin) {
        this.previewPlugin = previewPlugin;
    }

    attach(manager) {
        manager.addPreviewHandler('text/markdown', this.handlePreview);
    }

    handlePreview: SidebarPreviewRender = (model, $thumbnailDiv, $thumbnailContainer, fallback) => {
        const previewWidth = ($thumbnailContainer.parent().width() as number) + 50;  // 50px for negative margins
        const previewHeight = previewWidth / (16 / 9);

        $.when(
            this.getFileContent(model.getFullPath()),
            this.previewPlugin.init()
        ).then(([content]) => {
            console.log(content);
            $thumbnailDiv.removeClass('icon-loading icon-32');
            $thumbnailContainer.addClass('large');
            $thumbnailContainer.addClass('text');
            const $textPreview = $('<div id="preview" class="text-markdown"/>');
            this.previewPlugin.preview(content, $textPreview);
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