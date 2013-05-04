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
				editor.width(halfWidth - 10);
				OC.addScript('files_markdown', 'marked').then(function () {
					if (!mathJaxLoaded) {
						var script = document.createElement("script");
						script.type = "text/x-mathjax-config";
						script[(window.opera ? "innerHTML" : "text")] =
							"MathJax.Hub.Config({\n" +
								"  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
								"});"
						$('head')[0].appendChild(script);

						var path = OC.filePath('files_markdown', 'js', 'mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML');
						//insert using native dom to prevent jquery from removing the script tag
						$('head')[0].appendChild($('<script/>').attr('src', path)[0]);
						mathJaxLoaded = true;
					}
					var render = function () {
						var text = window.aceEditor.getSession().getValue(),
							html = marked(text);
						preview.html(html);
						if (window.MathJax) {
							MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview[0]]);
						}
					};
					render();
					window.aceEditor.getSession().on('change', render);
					$(window).resize(function () {
						fillWindow($('#editor'));
						var editor = $('#editor'),
							preview = $('#preview'),
							halfWidth = editor.width() / 2;
						preview.width(halfWidth);
						editor.width(halfWidth - 10);
						preview.height(editor.height());
					});
				});
				$.get(OC.filePath('files_markdown', 'ajax', 'checkconvert.php')).then(function (result) {
					if (result) {
						var downloadButton = $('<button/>');
						downloadButton.click(downloadPDF);
						downloadButton.text(t('files_markdown', 'Download PDF'));
						$('#editorcontrols').append(downloadButton);
					}
				});
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

function downloadPDF() {
	var html = $('#preview').html(),
		form = $('<form/>'),
		textfield = $('<textarea/>'),
		input = $('<input/>');

	form.attr('action', OC.filePath('files_markdown', 'ajax', 'download.php')).attr('method', 'post');
	input.attr('name', 'name');
	input.val($('div.crumb.last').text())
	form.append(input);

	textfield.attr('name', 'html');
	textfield.val(html);
	form.append(textfield);

	input = $('<input/>')
	input.attr('name', 'requesttoken');
	input.val(oc_requesttoken);
	form.append(input);

	input = $('<input/>')
	input.attr('name', 'mathjaxcss');//we need the css mathjax inserts for fonts and such
	input.val($('head style').last().text());
	form.append(input);

	form.hide();
	$('body').append(form);
	form.submit();
}

var mathJaxLoaded = false;
