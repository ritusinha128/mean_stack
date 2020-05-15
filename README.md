# mean_stack

hiii, I think its working but I wanted you to check. So just clone this repo, and change directory to the repository. Then use the following command:

# docker-compose up -d --build

Then run the following command:

# docker-compose ps

The output would be similar to :

           Name            |             Command           | State |                                     Ports 
---------------------------|-------------------------------|-------|--------------------------------------------------------------------
mean_stack_database_1      | docker-entrypoint.sh mongod   |Up     |0.0.0.0:27017->27017/tcp, 0.0.0.0:27018->27018/tcp, 0.0.0.0:27019 >27019/tcp                 |                               |       |
---------------------------|-------------------------------|-------|--------------------------------------------------------------------
mean_stack_mongo-express_1 |tini -- /docker-entrypoint ... |Up     |0.0.0.0:8081->8081/tcp  
---------------------------|-------------------------------|-------|--------------------------------------------------------------------
mean_stack_web_1           |  /bin/sh -c echo "Warming u ..|Up     |0.0.0.0:8082->3000/tcp, 5000/tcp 
---------------------------|-------------------------------|-------|--------------------------------------------------------------------

Use the port number of mean_stack_web_1 (in this case 8082)

Then use your web browser and check on localhost:8082. If not localhost, then use the docker machine IP address. To get this address, use the following:

#docker-machine ip

Use this IP address with the port number 8082 to access the website
