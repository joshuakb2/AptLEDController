# Build js files from ts files

default: .built

.built: ts/*
	tsc -b && touch .built

.PHONY: clean
clean:
	rm -f js/* .built
