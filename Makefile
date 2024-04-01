docker-image:
	podman build .

start:
	node run start

restore:
	npm i
