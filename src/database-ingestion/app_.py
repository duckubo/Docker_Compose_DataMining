import time
from connection import connect_to_db  # Nhập hàm connect_to_db từ database/connection.py

def insert_data(connection, name):
    if connection is None:
        print("Không thể kết nối đến cơ sở dữ liệu.", flush=True)
        return False

    try:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO my_table (name) VALUES (%s)", (name,))
            connection.commit()
            print(f"Đã thêm '{name}' vào cơ sở dữ liệu.", flush=True)
        return True
    except Exception as e:
        print(f"Lỗi khi chèn dữ liệu: {e}", flush=True)
        return False

if __name__ == "__main__":
    connection = connect_to_db()
    if connection is None:
        print("Không thể kết nối đến cơ sở dữ liệu. Dừng chương trình.", flush=True)
    else:
        try:
            while True:
                new_posts = insert_data(connection, "Rambutan-Banana")
                if new_posts:
                    print("Đã lưu các bài viết mới.", flush=True)
                else:
                    print("Không thể lưu bài viết mới.", flush=True)
                time.sleep(30)  # Tạm dừng 30 giây trước khi thêm dữ liệu mới
        finally:
            if connection and connection.open:
                connection.close()  # Đảm bảo rằng kết nối được đóng sau khi vòng lặp kết thúc
