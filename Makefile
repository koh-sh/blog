.PHONY: server new mod build ss

POST = example.md

server:
	hugo server

# make new POST=test.md
new:
	hugo new posts/${POST}

mod:
	hugo mod get -u

build:
	hugo

# convert screenshot to avif and mv to images
ss:
	./_utils/makeavif.sh
