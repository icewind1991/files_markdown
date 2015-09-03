/* global OCA, marked, hljs, MathJax */

OCA.Files_Markdown = {};

OCA.Files_Markdown.mathJaxLoaded = false;
OCA.Files_Markdown.markedLoadPromise = null;
OCA.Files_Markdown.highlightLoaded = null;

OCA.Files_Markdown.Preview = function () {
	this.renderer = null;
	this.head = document.head;
};

OCA.Files_Markdown.Preview.prototype.init = function () {
	var getUrl = this.getUrl.bind(this);

	$.when(
		this.loadMarked(),
		this.loadHighlight()
	).then(function () {
			this.renderer = new marked.Renderer();
			this.renderer.image = function (href, title, text) {
				var out = '<img src="' + getUrl(href) + '" alt="' + text + '"';
				if (title) {
					out += ' title="' + title + '"';
				}
				out += this.options.xhtml ? '/>' : '>';
				return out;
			};

			marked.setOptions({
				highlight: function (code) {
					return hljs.highlightAuto(code).value;
				},
				renderer: this.renderer
			});
		}.bind(this));
	this.loadMathJax();
};

OCA.Files_Markdown.Preview.prototype.getUrl = function (path) {
	if (!path) {
		return path;
	}
	if (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://' || path.substr(0, 3) === '://') {
		return path;
	} else {
		if (path.substr(0, 1) !== '/') {
			path = this.dir + '/' + path;
		}
		return OC.generateUrl('apps/files/ajax/download.php?dir={dir}&files={file}', {
			dir: OC.dirname(path),
			file: OC.basename(path)
		});
	}
};

OCA.Files_Markdown.Preview.prototype.preview = function (text, element) {
	console.log(text);
	var html = marked(text);
	element.html(html);
	if (window.MathJax) {
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]);
	};
};

OCA.Files_Markdown.Preview.prototype.loadMarked = function () {
	if (!OCA.Files_Markdown.markedLoadPromise) {
		OCA.Files_Markdown.markedLoadPromise = OC.addScript('files_markdown', 'marked');
	}
	return OCA.Files_Markdown.markedLoadPromise;
};

OCA.Files_Markdown.Preview.prototype.loadHighlight = function () {
	if (!OCA.Files_Markdown.highlightLoadPromise) {
		OCA.Files_Markdown.highlightLoadPromise = OC.addScript('files_markdown', 'highlight.pack');
	}
	return OCA.Files_Markdown.highlightLoadPromise;
};

OCA.Files_Markdown.Preview.prototype.loadMathJax = function () {
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
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', new OCA.Files_Markdown.Preview());
	}
});
