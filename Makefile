help: ## list all commands available for make
				@IFS=$$'\n' ; \
				help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
				for help_line in $${help_lines[@]}; do \
						IFS=$$'#' ; \
						help_split=($$help_line) ; \
						help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
						help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
						printf "%-30s %s\n" $$help_command $$help_info ; \
				done
build: ## build the image from Dockerfile. In our applications we have a server build on top of Nestjs framework, and Vue Typescript frontend binding with Nginx
				docker-compose -f docker-compose.yml build $(c)
migrate: ## Run database migrations inside the Docker container
				docker-compose exec lb4_app npm run migrate
up: ## Stopping and recreating the containers
				docker-compose -f docker-compose.yml up -d $(c)
start: ## Is used to start the containers. To start only one container for example if I only want to start db container run `make start c=database`
				docker-compose -f docker-compose.yml start $(c)
down: ## Is used to stop and shutdown containers. To shutdown specific container use for example if I only want to shutdown db container run `make down c=database`
				docker-compose -f docker-compose.yml down $(c)
destroy: ## Is used to destroy containers. To destroy specific container use for example if I only want to destroy db container run `make destroy c=database`
				docker-compose -f docker-compose.yml down -v $(c)
stop: ## Is used to stop containers. To stop specific container use for example if I only want to stop db container run `make destroy c=database`
				docker-compose -f docker-compose.yml stop $(c)
restart: ## Is used to restart containers. To restart specific container use for example if I only want to restart db container run `make down c=database`
				docker-compose -f docker-compose.yml stop $(c)
				docker-compose -f docker-compose.yml up -d $(c)
logs: ## Is used to see the log of the containers. To log specific container use for example if I only want to log db container run `make log c=database`
				docker-compose -f docker-compose.yml logs --tail=100 -f $(c)
ps: ## Is used to list the containers. To list specific container use for example if I only want to list db container run `make log c=database`
				docker-compose -f docker-compose.yml ps $(c)
sh: ## Is used to see sh into containers. To sh specific container use for example if I only want to sh server container run `make sh c=movies-server`
				docker exec -it $(c) sh
