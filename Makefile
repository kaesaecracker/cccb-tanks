clean:
	rm -r dist

dist:

docker-image:
	podman build .
