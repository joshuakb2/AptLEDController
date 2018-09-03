# Variable listing names of all ts files
TS_FILES = $(wildcard js/*.ts)

# For each ts file, use tsc to compile it to a js file.
$(TS_FILES:%.ts=%.js): %.js: %.ts
	if [ -f $@ ]; then mv $@ .$@; tsc $< || mv .$@ $@; else tsc $< || rm -f $@; fi

.PHONY: clean
clean:
	rm -f $(TS_FILES:%.ts=%.js)
