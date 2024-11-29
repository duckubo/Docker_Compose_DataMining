import os
import pymysql
import yaml
from flask import Flask, jsonify

app = Flask(__name__)

# Đường dẫn đến tệp config.gml
config_path = os.path.join(os.path.dirname(__file__), 'config/config.yml')

# Tải cấu hình từ tệp YAML
with open(config_path, 'r') as config_file:
    config = yaml.safe_load(config_file)

# Hàm kiểm tra kết nối đến cơ sở dữ liệu
def test_db_connection():
    try:
        connection = pymysql.connect(
            host=config['database']['host'],
            user=config['database']['username'],
            password=config['database']['password'],
            db=config['database']['database_name']
        )
        # Thực hiện một truy vấn đơn giản để xác minh kết nối
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"Database version: {version[0]}")
        connection.close()
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False

@app.route('/api/test_db', methods=['GET'])
def test_database():
    if test_db_connection():
        return jsonify({"message": "Database connection successful"}), 200
    else:
        return jsonify({"message": "Database connection failed"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
