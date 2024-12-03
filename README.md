"# Docker_Compose_DataMining"
cd logs
docker-compose up --build
docker ps -a
docker ps
docker-compose up database-ingestion   
docker-compose down
Để xóa volume, bạn có thể sử dụng lệnh:
docker volume rm <volume_name>
Hoặc nếu bạn muốn xóa tất cả các volume không sử dụng:
docker volume prune
http://localhost:3000/