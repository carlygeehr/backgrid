PROJECT_NAME = backgrid
PROJECT_URL = http://github.com/wyuenho/backgrid
AUTHOR = Jimmy Yuen Ho Wong

JS_FILES = preamble.js\
	formatter.js \
	cell.js \
	column.js \
	row.js \
	header.js \
	body.js \
	footer.js \
	grid.js
JS_OUTFILE = $(PROJECT_NAME).js
JS_OUTFILE_MIN = $(PROJECT_NAME).min.js

CSS_FILES = $(PROJECT_NAME).css
CSS_OUTFILE = $(PROJECT_NAME).css
CSS_OUTFILE_MIN = $(PROJECT_NAME).min.css

UGLIFY = uglifyjs
UGLIFY_BEAUTIFY_FLAGS = --beautify indent-level=2,indent-start=2,bracketize=true \
						--compress sequences=false,properties=false,dead-code=false,unsafe=false,conditionals=false,comparisons=false,evaluate=false,booleans=false,loops=false,unused=false,hoist-funs=false,hoist-vars=false,join-vars=false,cascade=false,warnings=true \
						--comments '/^(?!jshint|global)([.\s\S](?!@license))+$$/'
UGLIFY_MINIFY_FLAGS = --compress --mangle


all: clean dist test

FORCE:

%.js %.css: FORCE
	echo "/*\n\
	  $(PROJECT_NAME)\n\
	  $(PROJECT_URL)\n\n\
	  Copyright (c) `date +%Y` $(AUTHOR)\n\
	  Licensed under the MIT @license.\n\
	*/" | cat - $@ > "/tmp/`basename $@`" && mv -f "/tmp/`basename $@`" $@

js:
	$(UGLIFY) $(JS_FILES) $(UGLIFY_BEAUTIFY_FLAGS) --output $(JS_OUTFILE)
	echo "(function (root, $$, _, Backbone) {\n" | cat - $(JS_OUTFILE) > /tmp/$(JS_OUTFILE) && mv -f /tmp/$(JS_OUTFILE) $(JS_OUTFILE)
	echo "}(this, $$, _, Backbone));" >> $(JS_OUTFILE)
	make $(JS_OUTFILE)

csslint:
	recess $(CSS_FILES) --noIDS --noUniversalSelectors --compile > /tmp/$(CSS_OUTFILE) && mv -f /tmp/$(CSS_OUTFILE) $(CSS_OUTFILE);

minify: js
	$(UGLIFY) $(JS_OUTFILE) $(UGLIFY_MINIFY_FLAGS) --output $(JS_OUTFILE_MIN)
	recess $(CSS_FILES) --noIDS --noUniversalSelectors --compress > /tmp/$(CSS_OUTFILE_MIN) && mv -f /tmp/$(CSS_OUTFILE_MIN) $(CSS_OUTFILE_MIN);

build: minify
	$(MAKE) $(JS_OUTFILE_MIN)
	$(MAKE) $(CSS_OUTFILE_MIN)

dist: build
	cp -f $(JS_OUTFILE) $(DIST_DIR)/$(JS_OUTFILE)
	cp -f $(JS_OUTFILE_MIN) $(DIST_DIR)/$(JS_OUTFILE_MIN)
	cp -f $(CSS_OUTFILE) $(DIST_DIR)/$(CSS_OUTFILE)
	cp -f $(CSS_OUTFILE_MIN) $(DIST_DIR)/$(CSS_OUTFILE_MIN)

test: FORCE
	phantomjs ../../bin/qunit-runner.js test/index.html

clean:
	rm -rf $(JS_OUTFILE) $(JS_OUTFILE_MIN) $(CSS_OUTFILE_MIN)

.EXPORT_ALL_VARIABLES: