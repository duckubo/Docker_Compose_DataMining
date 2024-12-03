from pymysql import Error
from pymysqlreplication import BinLogStreamReader
from pymysqlreplication.row_event import DeleteRowsEvent, UpdateRowsEvent, WriteRowsEvent
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from connection import connect_to_db 
import joblib
import numpy as np
# Thông tin kết nối đến MySQL
mysql_settings = {
    "host": "database",  # Thay đổi thành host của MySQL nếu khác
    "port": 3306,  # Cổng mặc định của MySQL
    "user": "root",  # Tên người dùng MySQL
    "passwd": "root"  # Mật khẩu MySQL
}

# Hàm xử lý sự kiện từ MySQL
def binlog_stream():
    stream = BinLogStreamReader(
        connection_settings=mysql_settings,
        server_id=101,  # Server ID của binlog
        blocking=True,  # Đọc liên tục các sự kiện
        only_schemas=["stock-data"],
        only_tables=["stocks_data"],
        only_events=[DeleteRowsEvent, UpdateRowsEvent, WriteRowsEvent]  # Các sự kiện muốn theo dõi
    )

    # Đọc và xử lý sự kiện từ binary log
    for binlogevent in stream:
        for row in binlogevent.rows:
            event_data = {}
            if isinstance(binlogevent, WriteRowsEvent):
                event_data = {
                    "event": "insert",
                    "table": binlogevent.table,
                    "data": row
                }
                while True: 
                    tickers = ["AAPL", "AMZN", "GOOG"]
                    for ticker in tickers:
                        saveArimaPredictData(ticker)
                        saveArimaPredictData7(ticker)
            elif isinstance(binlogevent, UpdateRowsEvent):
                event_data = {
                    "event": "update",
                    "table": binlogevent.table,
                    "data": row
                }
            elif isinstance(binlogevent, DeleteRowsEvent):
                event_data = {
                    "event": "delete",
                    "table": binlogevent.table,
                    "data": row
                }

    stream.close()

def loadClusterData(code):
    try:
        connection = connect_to_db()
        if connection is None:
            return None

        with connection.cursor() as cursor:
            # Write your SQL query
            sql_query = "SELECT * FROM stocks_data WHERE Code = %s ORDER BY datetime desc LIMIT 1000" 
            params = (code) 
            # Execute the query
            cursor.execute(sql_query,params)
            
            # Fetch all the results
            results = cursor.fetchall()
            
            
            column_names = [desc[0] for desc in cursor.description]
            
            # Create DataFrame with column names
            df = pd.DataFrame(list(results), columns=column_names)
            # Hiển thị các dòng đầu tiên
            return df
    finally:
        # Close the connection
        connection.close()
def loadSeasonData(code):
    try:
        connection = connect_to_db()
        if connection is None:
            return None

        with connection.cursor() as cursor:
            # Write your SQL query
            sql_query = "SELECT * FROM stocks_data WHERE Code = %s ORDER BY datetime desc LIMIT 1000" 
            params = (code) 
            # Execute the query
            cursor.execute(sql_query,params)
            
            # Fetch all the results
            results = cursor.fetchall()
            
            
            column_names = [desc[0] for desc in cursor.description]
            
            # Create DataFrame with column names
            df = pd.DataFrame(list(results), columns=column_names)
            # Hiển thị các dòng đầu tiên
            return df
    finally:
        # Close the connection
        connection.close()
def saveClusterData(df,code):
    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')

    # Chuyển đổi dữ liệu theo dạng ngày và tính nhiệt độ trung bình trong ngày
    daily_data = df[['datetime', 'volume']].set_index('datetime')

    # Chuẩn bị dữ liệu phân cụm: Sử dụng nhiệt độ cho phân cụm
    df_cluster = daily_data[['volume']].copy() # Chỉ dùng cột 'temperature' cho KMeans
    print(df_cluster.shape)
    scaler = StandardScaler()
    df_cluster_scaled = scaler.fit_transform(df_cluster[['volume']])  # Chỉ chuẩn hóa cột nhiệt độ

    # Áp dụng KMeans phân cụm vào 4 cụm
    kmeans = KMeans(n_clusters=6, random_state=0)
    df_cluster['cluster'] = kmeans.fit_predict(df_cluster_scaled)
    scatter_data = []
    for i in range(6):
        subset = df_cluster[df_cluster['cluster'] == i]
        print(f"Cluster {i} has {len(subset)} rows")
        for index, row in subset.iterrows():
            scatter_data.append({
                "Code" :code, 
                "index": index,
                "volume": row['volume'],
                "season": i
            })
    scatter_df = pd.DataFrame(scatter_data)
    
    try:
        connection = connect_to_db()
        if connection is None:
            return None
        
        cursor = connection.cursor()
        delete_sql = "DELETE FROM scatter_data_trend WHERE Code = %s"  # Make sure 'Code' is the identifier
        cursor.execute(delete_sql, (code,))
        
        scatter_values = scatter_df.values.tolist()
        
        # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
        sql = """
            INSERT INTO scatter_data_trend
            VALUES (%s, %s, %s, %s)
            """
        # Thực thi câu lệnh SQL với dữ liệu từ scatter_df
        cursor.executemany(sql, scatter_values)
        
        # Commit để lưu thay đổi vào cơ sở dữ liệu
        connection.commit()
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        cursor.close()
        connection.close()
        
def saveArimaPredictData(code):
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        
        model = joblib.load(f'model/arima/arima_model_{code}.pkl')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle

        # Dự đoán giá cổ phiếu trong 1 ngày
        forecast_days = 1

        # Dự đoán giá cổ phiếu
        forecast = model.forecast(steps=forecast_days)
       
        cursor = connection.cursor()
        cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (code,))
        actual_value = cursor.fetchone()
        
        rmse = np.sqrt(np.mean((np.array(actual_value) - np.array(forecast))**2))
        
        delete_sql = "DELETE FROM predictions_arima WHERE Code = %s"  # Make sure 'Code' is the identifier
        cursor.execute(delete_sql, (code,))
        
        
        # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
        sql = """
            INSERT INTO predictions_arima
            VALUES (%s, %s, %s)
            """
        print(forecast[0])
        # Thực thi câu lệnh SQL với dữ liệu từ scatter_df
        cursor.execute(sql, (forecast[0],rmse,code ))
        
        # Commit để lưu thay đổi vào cơ sở dữ liệu
        connection.commit()

                
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveArimaPredictData7(code):
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        
        model = joblib.load(f'model/arima/arima_model_{code}.pkl')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle

        # Dự đoán giá cổ phiếu trong 1 ngày
        forecast_days = 1

        # Dự đoán giá cổ phiếu
        forecast = model.forecast(steps=forecast_days)
       
        cursor = connection.cursor()
        cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (code,))
        actual_value = cursor.fetchone()
        
        rmse = np.sqrt(np.mean((np.array(actual_value) - np.array(forecast))**2))
        
        delete_sql = "DELETE FROM predictions_arima WHERE Code = %s"  # Make sure 'Code' is the identifier
        cursor.execute(delete_sql, (code,))
        
        
        # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
        sql = """
            INSERT INTO predictions_arima
            VALUES (%s, %s, %s)
            """
        print(forecast[0])
        # Thực thi câu lệnh SQL với dữ liệu từ scatter_df
        cursor.execute(sql, (forecast[0],rmse,code ))
        
        # Commit để lưu thay đổi vào cơ sở dữ liệu
        connection.commit()

                
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveLstmPredictData(code):
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        
        model = joblib.load(f'model/lstm/lstm_model_{code}.h5')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle

       
        cursor = connection.cursor()
        cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (code,))
        actual_value = cursor.fetchone()
        
        
        delete_sql = "DELETE FROM predictions_lstm WHERE Code = %s"  # Make sure 'Code' is the identifier
        cursor.execute(delete_sql, (code,))
        
        
        # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
        sql = """
            INSERT INTO predictions_lstm
            VALUES (%s, %s, %s)
            """
        # Commit để lưu thay đổi vào cơ sở dữ liệu
        connection.commit()

                
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveLinearPredictData(code):
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        cursor = connection.cursor()

        # Truy vấn 7 ngày gần nhất để khởi tạo dự đoán
        cursor.execute("""
            SELECT open, high, low, volume, close 
            FROM stocks_data 
            WHERE code = %s 
            ORDER BY datetime DESC 
            LIMIT 7
        """, (code,))
        actual_values = cursor.fetchall()

        # Chuyển đổi dữ liệu từ cơ sở dữ liệu sang DataFrame
        column_names = ['open', 'high', 'low', 'volume', 'close']
        df = pd.DataFrame(actual_values, columns=column_names)

        # Đảm bảo dữ liệu theo thứ tự thời gian (tăng dần)
        df = df.iloc[::-1]

        # Chuẩn bị mô hình Linear Regression
        model = joblib.load(f'model/linear/linear_regression_stock_model_{code}.pkl')  # Tải mô hình đã lưu

        # Khởi tạo danh sách dự đoán
        predictions = []
        rmse_list = []

        # Lặp qua 7 ngày để dự đoán
        for day in range(7):
            # Tách các đặc trưng đầu vào
            X = df[['close']].iloc[-1:].values 
            y_actual = df['close'].iloc[-1]  # Lấy giá trị thực tế cuối cùng

            # Dự đoán giá
            y_pred = model.predict(X)[0]
            predictions.append(y_pred)

            # Tính RMSE cho ngày hiện tại
            rmse = np.sqrt((y_actual - y_pred) ** 2)
            rmse_list.append(rmse)

            # Thêm giá trị dự đoán mới vào DataFrame để dùng cho ngày kế tiếp
            new_row = {
                'close': y_pred  # Giá trị close được dự đoán
            }
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

        # Xóa các dự đoán cũ khỏi bảng
        delete_sql = "DELETE FROM predictions_lr WHERE Code = %s"
        cursor.execute(delete_sql, (code,))
        pred = predictions[0]
        rmse = rmse_list[0]
        # Lưu dự đoán mới vào cơ sở dữ liệu
        insert_sql = "INSERT INTO predictions_lr (Prediction, RMSE, Code) VALUES (%s, %s, %s)"
        cursor.execute(insert_sql, ( pred, rmse,code))
        print(pred)
        # Commit thay đổi
        connection.commit()


    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        # Đảm bảo đóng kết nối
        cursor.close()
        connection.close()
            
if __name__ == "__main__":
    binlog_stream()