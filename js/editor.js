/* global OCA, marked, hljs, MathJax */

OCA.Files_Markdown = {};

OCA.Files_Markdown.overWriteEditor = function () {
	if (window.hideFileEditor) {
		var hideFileEditorOriginal = window.hideFileEditor;
		var reopenEditorOriginal = window.reopenEditor;
	}
	// Fades out the editor.
	window.hideFileEditor = function () {
		hideFileEditorOriginal();
		if ($('#editor').attr('data-edited') === 'true') {
			$('#md_preview').hide();
		} else {
			$('#md_preview').remove();
		}
	};

	// Reopens the last document
	window.reopenEditor = function () {
		reopenEditorOriginal();
		$('#md_preview').show();
	};
};

OCA.Files_Markdown.mathJaxLoaded = false;
OCA.Files_Markdown.markedLoadPromise = null;
OCA.Files_Markdown.highlightLoaded = null;

OCA.Files_Markdown.Editor = function (editor, head) {
	this.editor = editor;
	this.head = head;
	this.preview = $('<div/>');
	this.wrapper = $('<div/>');
};

OCA.Files_Markdown.Editor.prototype.init = function (editorSession) {
	this.preview.attr('id', 'md_preview');
	this.wrapper.attr('id', 'preview_wrapper');
	this.wrapper.append(this.preview);
	this.editor.parent().append(this.wrapper);
	this.editor.css('width', '50%');
	var onChange = this._onChange.bind(this, editorSession);

	$.when(
		this.loadMarked(),
		this.loadHighlight()
	).then(function () {
			editorSession.on('change', onChange);
			onChange();

			marked.setOptions({
				highlight: function (code) {
					return hljs.highlightAuto(code).value;
				}
			});
			onChange();
		});
	this.loadMathJax();
};

OCA.Files_Markdown.Editor.prototype._onChange = function (editorSession) {
	var text = editorSession.getValue();
	var html = marked(text);
	this.preview.html(html);
	if (window.MathJax) {
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.preview[0]]);
	}
};

OCA.Files_Markdown.Editor.prototype.loadMarked = function () {
	if (!OCA.Files_Markdown.markedLoadPromise) {
		OCA.Files_Markdown.markedLoadPromise = OC.addScript('files_markdown', 'marked');
	}
	return OCA.Files_Markdown.markedLoadPromise;
};

OCA.Files_Markdown.Editor.prototype.loadHighlight = function () {
	if (!OCA.Files_Markdown.highlightLoadPromise) {
		OCA.Files_Markdown.highlightLoadPromise = OC.addScript('files_markdown', 'highlight.pack');
	}
	return OCA.Files_Markdown.highlightLoadPromise;
};

OCA.Files_Markdown.Editor.prototype.loadMathJax = function () {
	if (OCA.Files_Markdown.mathJaxLoaded) {
		return;
	}
	OCA.Files_Markdown.mathJaxLoaded = true;
	var script = document.createElement("script");
	script.type = "text/x-mathjax-config";
	script[(window.opera ? "innerHTML" : "text")] =
		"MathJax.Hub.Config({\n" +
		"  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
		"});";
	this.head.appendChild(script);

	var path = OC.filePath('files_markdown', 'js', 'mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML');

	//insert using native dom to prevent jquery from removing the script tag
	script = document.createElement("script");
	script.src = path;
	this.head.appendChild(script);
};

$(document).ready(function () {
	if (OCA.Files) {
		OCA.Files.fileActions.register('text/markdown', 'Edit', OC.PERMISSION_READ, '', function (filename, context) {
			window.showFileEditor(context.dir, filename).then(function () {
				var editor = new OCA.Files_Markdown.Editor($('#editor'), $('head')[0]);
				editor.init(window.aceEditor.getSession());
			});
		});
		OCA.Files.fileActions.setDefault('text/markdown', 'Edit');

		OCA.Files_Markdown.overWriteEditor();
	}
});
