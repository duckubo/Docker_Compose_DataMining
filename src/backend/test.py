from flask import Flask, jsonify, request
import requests
import pandas as pd
import threading
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
import joblib
# Biến toàn cục
df = pd.DataFrame()  # Khởi tạo DataFrame rỗng
data_fetched_event = threading.Event()

DATABASE_API_URL = "http://localhost:5000/api/stocks-data"  # URL của API của bạn

# Định nghĩa hàm get_data
def get_data():
    global df  # Sử dụng biến toàn cục df
    try:
        # Lặp qua các ticker và lấy dữ liệu
        response = requests.get(DATABASE_API_URL)
        if response.status_code == 200:
            data = response.json()
            df = pd.DataFrame(data)  # Cập nhật dữ liệu vào df
            print(df["1"].head(10))
            # In ra shape của DataFrame
            print(f"Shape of DataFrame: {df.head(10)}")
        else:
            print(f"Error fetching data: {response.status_code}")
        
        # Sau khi dữ liệu đã được lấy xong, thông báo cho các phần khác có thể tiếp tục
        data_fetched_event.set()
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")
def trend_data():
    try:
        tickers = ["AAPL", "AMZN", "GOOG"]
        for ticker in tickers:
            df_trend =df[[df["7"]== ticker]]
            df_trend['price'] = df_trend['5']
            # Lọc dữ liệu để chỉ lấy cột `Price` và `Date`
            Quantity_date = df_trend[['price', '1']]

            # Đặt `Date` làm chỉ mục sau khi chuyển đổi thành datetime
            Quantity_date.index = Quantity_date['1']

            # Chuyển đổi `Price` về kiểu float để đảm bảo định dạng số cho biểu đồ
            Quantity_date['price'] = Quantity_date['price'].map(lambda x: float(x))

            # Điền giá trị NaN bằng cách sử dụng phương pháp backfill
            Quantity_date = Quantity_date.fillna(Quantity_date.bfill())

            # Xóa cột `Date` vì chỉ mục đã được sử dụng
            # Xóa cột `Date` vì chỉ mục đã được sử dụng
            Quantity_date = Quantity_date.drop(['1'], axis=1)
            print(Quantity_date.head(10))
    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")
            
    

DATABASE_API_URL1 = "http://localhost:5000/api/stock-info"
def saveArimaPredictData():
  
    try:
        tickers = ["AAPL", "AMZN", "GOOG"]
        for ticker in tickers:
            response = requests.get(f"{DATABASE_API_URL1}?ticket={ticker}")
            if response.status_code == 200:
                data = response.json()
                
                if "newest_data" in data:  # Kiểm tra nếu 'newest_data' tồn tại
                    newest_data = data["newest_data"]
                    
                    newest = pd.DataFrame(newest_data)
                    
                    print(f"Shape of DataFrame: {newest['close']}")
                else:
                    print("Nothing")
            else:
                print(f"Error fetching data: {response.status_code}")
                model = joblib.load(f'model/arima/arima_model_{ticker}.pkl')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle

    #     # Dự đoán giá cổ phiếu trong 1 ngày
    #         forecast_days = 1

    #         # Dự đoán giá cổ phiếu
    #         forecast = model.forecast(steps=forecast_days)
        
    #         cursor = connection.cursor()
    #         cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (ticker,))
    #         actual_value = cursor.fetchone()
            
    #         rmse = np.sqrt(np.mean((np.array(actual_value) - np.array(forecast))**2))
            
    #         delete_sql = "DELETE FROM predictions_arima WHERE Code = %s"  # Make sure 'Code' is the identifier
    #         cursor.execute(delete_sql, (ticker,))
            
            
    #         # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
    #         sql = """
    #             INSERT INTO predictions_arima
    #             VALUES (%s, %s, %s)
    #             """
    #         print(forecast[0])
    #         # Thực thi câu lệnh SQL với dữ liệu từ scatter_df
    #         cursor.execute(sql, (forecast[0],rmse,ticker ))
            
    #         # Commit để lưu thay đổi vào cơ sở dữ liệu
    #         connection.commit()

                
    # except Error as e:
    #     print(f"Error saving to database: {e}")
    # finally:
    #     connection.close()
    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")


def print_dataframe():
    data_fetched_event.wait()  # Chờ cho đến khi event được set bởi get_data()
    
    # Kiểm tra nếu df không rỗng
    if not df.empty:
        # In ra shape của DataFrame
        print(f"Shape of DataFrame: {df.shape}")
        
        # In ra 10 dòng đầu tiên của DataFrame
        print("First 10 rows of DataFrame:")
        print(df.head(10))
    else:
        print("No data available to display.")

# Thiết lập các job của scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=get_data, trigger="interval", seconds=5)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=trend_data, trigger="interval", seconds=5)  # In dữ liệu mỗi 5 giây
# scheduler.add_job(func=saveArimaPredictData, trigger="interval", seconds=10)  # In dữ liệu mỗi 5 giây
scheduler.start()

# Gọi hàm để in dữ liệu
if __name__ == '__main__':
    try:
        # Đảm bảo rằng ứng dụng Flask không thoát khi chạy
        app.run(debug=True, use_reloader=False, port=6000)
    except (KeyboardInterrupt, SystemExit):
        pass
