# database/connection.py
import pymysql
import yaml
import os

# Đường dẫn đến tệp config.yml
config_path = os.path.join(os.path.dirname(__file__), 'config/config.yml')

# Tải cấu hình từ tệp YAML
with open(config_path, 'r') as config_file:
    config = yaml.safe_load(config_file)

# Thiết lập kết nối đến cơ sở dữ liệu
def connect_to_db():
    connection = pymysql.connect(
        host=config['database']['host'],
        user=config['database']['username'],
        password=config['database']['password'],
        db=config['database']['database_name']
    )
    return connection
