define([
	"babel"
], function (
	babel
) {
	var fetchText = function (url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function () {
			// Do not explicitly handle errors, those should be
			// visible via console output in the browser.
			if (xhr.readyState === 4) {
				callback(xhr.responseText);
			}
		};
		xhr.send(null);
	};

	babel.registerPlugin("apply-es6-recursively", function (args) {
		return {
			name: "apply-es6-recursively",

			pre: function () {
				this.types = args.types;
			},

			visitor: {
				Program: {
					enter: function (programPath, state) {
						programPath.traverse({
							"ImportDeclaration|ExportDeclaration": function (nodePath, state) {
								var nodePath = nodePath.get("source");
								if (!state.types.isStringLiteral(nodePath)) {
									return;
								}

								const sourcePath = nodePath.node.value;
								if (sourcePath.indexOf("!") < 0) {
									// If sourcePath is relative (ex: "./foo"), it"s relative to currentFile.
									var currentFile = state.file.opts.sourceFileName;
									var absSourcePath = /^\.?\.\//.test(sourcePath) ?
										currentFile.replace(/[^/]*$/, "") + sourcePath : sourcePath;
									var modulePath = "es6!" + absSourcePath;

									nodePath.replaceWith(state.types.stringLiteral(modulePath));
									nodePath.node.pathResolved = true;
								}
							}
						}, state);
					}
				}
			}
		}
	});

	return {
		load: function (name, req, onload) {
			var sourceFileName = /\./.test(name) ? name : name + ".js";
			var url = req.toUrl(sourceFileName);

			if (url.indexOf("empty:") === 0) {
				return onload();
			}

			var options = {
				sourceFileName: sourceFileName,
				sourceMap: "inline",
				plugins: [
					"transform-modules-amd",
					"apply-es6-recursively"
				]
			};

			fetchText(url, function (text) {
				var code;
				try {
					code = babel.transform(text, options).code;
				} catch (error) {
					return onload.error(error);
				}

				onload.fromText(code);
			});
		}
	};
});
