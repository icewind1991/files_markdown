$(document).ready(function () {
	if (typeof FileActions !== 'undefined') {
		FileActions.register('text/markdown', 'Edit', OC.PERMISSION_READ, '', function (filename) {
			showFileEditor($('#dir').val(), filename).then(function () {
				var editor = $('#editor'),
					preview = $('<div/>'),
					wrapper = $('<div/>');
				preview.attr('id', 'preview');
				wrapper.attr('id', 'preview_wrapper');
				wrapper.append(preview);
				editor.parent().append(wrapper);
				editor.css('width', '50%');
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

var mathJaxLoaded = false;
