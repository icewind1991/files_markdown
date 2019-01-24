import {PreviewPlugin} from "./PreviewPlugin";
import {SidebarPreview} from "./SidebarPreview";
import {PublicPreview} from "./PublicPreview";

const previewPlugin = new PreviewPlugin();

$(() => {
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', previewPlugin);
	}

	if (
		$('#isPublic').val() &&
		$('#mimetype').val() === 'text/markdown'
	) {
		const publicPreview = new PublicPreview();
		const previewRoot = $('#preview');
		previewRoot.addClass('text-markdown');
		const previewFrame = $('<div class="public-preview"/>');
		previewRoot.prepend(previewFrame);
		publicPreview.attach(previewFrame, $('#sharingToken').val() as string);
	}
});

// coerce webpack into loading scripts properly
__webpack_require__.p = OC.filePath('files_markdown', 'js', '../build/');
const script = document.querySelector('[nonce]') as HTMLScriptElement;
__webpack_require__.nc = script['nonce'] || script.getAttribute('nonce');

OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview());
