import {PreviewPlugin} from "./PreviewPlugin";
import {SidebarPreview} from "./SidebarPreview";

const previewPlugin = new PreviewPlugin();

$(document).ready(function () {
    if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
        OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', previewPlugin);
    }
});

// fix editor closing when click on dialog

// OCA.Files_Texteditor._onClickDocument

// coerce webpack into loading scripts properly
__webpack_require__.p = OC.filePath('files_markdown', 'js', '../build/');
__webpack_require__.nc = $('script[nonce]')[0].getAttribute('nonce');

OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview());
