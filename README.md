# loopback4_todo

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the [initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Prerequisites

To run this application, you only need to have the following installed on your system:

- [Docker](https://www.docker.com/get-started)
- [Make](https://www.gnu.org/software/make/)

## Getting Started

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run the following command to build and start the application:

```sh
make build && make up
```

This will build the Docker images and start the containers defined in the `docker-compose.yml` file.

## Available Make Commands

Here's a list of all available make commands:

- `make help`: List all commands available for make
- `make build`: Build the image from Dockerfile
- `make migrate`: Run database migrations inside the Docker container (Required to run `make up` first)
- `make up`: Stop and recreate the containers
- `make start`: Start the containers
- `make down`: Stop and shutdown containers
- `make destroy`: Destroy containers
- `make stop`: Stop containers
- `make restart`: Restart containers
- `make logs`: View container logs
- `make ps`: List containers
- `make sh`: Open a shell in a container

You can run these commands with specific containers by adding `c=container_name`. For example:

```sh
make start c=database
```

## Accessing the Application

Once the containers are up and running, you can access the application at:

http://localhost:3000

## API Documentation

The API documentation (OpenAPI spec) can be accessed at:

http://localhost:3000/explorer

## Development

For development purposes, you can use the following commands:

- To rebuild the project: `make build`
- To view logs: `make logs`
- To stop the application: `make stop`
- To restart the application: `make restart`

## Troubleshooting

If you encounter any issues, please check the logs using `make logs` command. If you need to reset the entire environment, you can use `make destroy` followed by `make build` and `make up`.

## Play With Api

You can import the postman example from `./postman/LB4 TODO API.postman_collection.json` to have fun with it.
