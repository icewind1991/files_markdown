import {PreviewPlugin} from "./PreviewPlugin";
import {SidebarPreview} from "./SidebarPreview";

const previewPlugin = new PreviewPlugin();

$(document).ready(function () {
    if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
        OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', previewPlugin);
    }
});

// coerce webpack into loading scripts properly
__webpack_require__.p = OC.filePath('files_markdown', 'js', '../build/');
const script = document.querySelector('[nonce]') as HTMLScriptElement;
__webpack_require__.nc = script['nonce'] || script.getAttribute('nonce');

OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview());
