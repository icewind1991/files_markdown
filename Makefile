app_name=files_markdown
project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
sign_dir=$(build_dir)/sign
cert_dir=$(HOME)/.nextcloud/certificates

all: js/editor.js

sources=$(wildcard js/*.ts) $(wildcard js/*/*.ts) js/tsconfig.json

.PHONY: watch
watch: js/node_modules
	cd js && node_modules/.bin/watchify --debug editor.ts -p tsify -o editor.js

clean:
	rm -rf $(build_dir)

js/node_modules: js/package.json
	cd js && npm install

js/editor.js: $(sources) js/node_modules
	cd js && node_modules/.bin/browserify editor.ts -p tsify -o editor.js

appstore: clean js/node_modules
	mkdir -p $(sign_dir)
	rsync -a \
	--exclude=.git \
	--exclude=build \
	--exclude=.gitignore \
	--exclude=Makefile \
	--exclude=screenshots \
	--exclude=phpunit*xml \
	$(project_dir) $(sign_dir)
	tar -czf $(build_dir)/$(app_name).tar.gz \
		-C $(sign_dir) $(app_name)
	openssl dgst -sha512 -sign $(cert_dir)/$(app_name).key $(build_dir)/$(app_name).tar.gz | openssl base64
