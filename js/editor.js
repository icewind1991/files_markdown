$(document).ready(function () {
	if (typeof FileActions !== 'undefined') {
		FileActions.register('text/markdown', 'Edit', OC.PERMISSION_READ, '', function (filename) {
			console.log('markdown');
			showFileEditor($('#dir').val(), filename).then(function () {
				var editor = $('#editor'),
					preview = $('<div/>'),
					halfWidth = editor.width() / 2;
				preview.attr('id', 'preview');
				preview.width(halfWidth);
				preview.height(editor.height());
				editor.parent().append(preview);
				editor.width(halfWidth);
				OC.addScript('files_markdown', 'marked').then(function () {
					var render = function () {
						var text = window.aceEditor.getSession().getValue(),
							html = marked(text);
						preview.html(html);
					};
					render();
					window.aceEditor.getSession().on('change', render);
					$(window).resize(function () {
						var editor = $('#editor'),
							preview = $('#preview'),
							halfWidth = editor.width() / 2;
						preview.width(halfWidth);
						editor.width(halfWidth);
						preview.height(editor.height());
					});
				})
			});
		});
		FileActions.setDefault('text/markdown', 'Edit');
	}

	//overwrite these functions from the text editor so we can hide/show the preview

	var hideFileEditorOriginal = hideFileEditor;
	var reopenEditorOriginal = reopenEditor;
	// Fades out the editor.
	hideFileEditor = function () {
		hideFileEditorOriginal()
		if ($('#editor').attr('data-edited') == 'true') {
			$('#preview').hide();
		} else {
			$('#preview').remove();
		}
	}

	// Reopens the last document
	reopenEditor = function () {
		reopenEditorOriginal();
		$('#preview').show();
	}
});
