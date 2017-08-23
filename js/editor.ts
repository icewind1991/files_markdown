import {PreviewPlugin} from "./PreviewPlugin";
import {SidebarPreview} from "./SidebarPreview";

const previewPlugin = new PreviewPlugin();

$(document).ready(function () {
    if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
        OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', previewPlugin);
    }
});

OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview(previewPlugin));
