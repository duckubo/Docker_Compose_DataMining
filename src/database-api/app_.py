from flask import Flask, jsonify
from connection import connect_to_db    # Thay connection bằng hàm connect_to_db
import yaml
import os
from flask_cors import CORS  
app = Flask(__name__)

CORS(app, resources={r"/data": {"origins": "http://localhost:3000"}})
# Đường dẫn đến tệp config.yml
config_path = os.path.join(os.path.dirname(__file__), '../config/config.yml')

# Tải cấu hình từ tệp YAML để lấy thông tin API
with open(config_path, 'r') as config_file:
    config = yaml.safe_load(config_file)

@app.route('/data', methods=['GET'])
def get_data():
    # Mở kết nối mới cho mỗi yêu cầu
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM close_data")
            result = cursor.fetchall()
        result_list = [
            {"Code": row[0], "Date": row[1], "Price": row[2]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 
        return jsonify(result_list)
    except Exception as e:
        return jsonify({"error": f"Lỗi khi truy vấn cơ sở dữ liệu: {e}"}), 500
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu

if __name__ == '__main__':
    app.run(host=config['api']['host'], port=config['api']['port'])
