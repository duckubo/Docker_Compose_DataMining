# Sử dụng image MySQL
FROM mysql:8.0

# Đặt biến môi trường cho MySQL
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=stock-data

# Sao chép tệp khởi tạo SQL vào thư mục chứa các tệp khởi tạo của MySQL
COPY init.sql /docker-entrypoint-initdb.d/