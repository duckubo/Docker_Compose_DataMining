from pymysql import Error
from flask import Flask, jsonify, request
import pandas as pd
from sklearn.preprocessing import StandardScaler,MinMaxScaler
from sklearn.cluster import KMeans
import numpy as np
# Thông tin kết nối đến MySQL
import threading
from connection import connect_to_db 
from statsmodels.tsa.seasonal import seasonal_decompose
# Định nghĩa hàm get_data
import threading
from apscheduler.schedulers.background import BackgroundScheduler
import re
from textblob import TextBlob
app = Flask(__name__)
import joblib
# Biến toàn cục
  # Khởi tạo DataFrame rỗng
twit = pd.DataFrame()  # Khởi tạo DataFrame rỗng
data_fetched_event = threading.Event()

import pandas as pd

def loadData():
    global df_base
    try:
        connection = connect_to_db()
        if connection is None:
            return None
        with connection.cursor() as cursor:
            # Write your SQL query
            sql_query = "SELECT * FROM stocks_data  ORDER BY datetime desc LIMIT 5000"
            # Execute the query
            cursor.execute(sql_query)
            
            # Fetch all the results
            results = cursor.fetchall()
            
            # Extract column names from cursor description
            column_names = [desc[0] for desc in cursor.description]
            
            # Create DataFrame with column names
            data = pd.DataFrame(list(results), columns=column_names)
            
            # Store the data in the dictionary with ticker as the key
            df_base = data
    finally:
        # Close the connection
        if connection:
            connection.close()

def loadTwit():
    global twit 
    try:
        connection = connect_to_db()
        if connection is None:
            return None
        with connection.cursor() as cursor:
            # Write your SQL query
            sql_query = "SELECT * FROM tweets"
            # Execute the query
            cursor.execute(sql_query)
            
            # Fetch all the results
            results = cursor.fetchall()
            
            # Extract column names from cursor description
            column_names = [desc[0] for desc in cursor.description]
            
            # Create DataFrame with column names
            data = pd.DataFrame(list(results), columns=column_names)
            
            # Store the data in the dictionary with ticker as the key
            twit = data
    finally:
        # Close the connection
        if connection:
            connection.close()
            
def saveTrendSeasonData():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        df = df_base.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
    # Lọc dữ liệu theo code và chuẩn hóa cột
            df_code = df[df['code'] == ticker].copy()
            df_code['datetime'] = pd.to_datetime(df_code['datetime'])
            df_code['close'] = pd.to_numeric(df_code['close'])
            
            # Lấy dữ liệu 365 ngày gần nhất
            data = df_code['close'].tail(365)
            
            # Áp dụng phân rã
            decomposition = seasonal_decompose(data, model='multiplicative', period=12)
            trend = pd.DataFrame(decomposition.trend).dropna()
            seasonal = pd.DataFrame(decomposition.seasonal).dropna()
            
            cursor = connection.cursor()
            
            # Xóa dữ liệu cũ của mã 'code'
            cursor.execute("DELETE FROM trend WHERE Code = %s", (ticker,))
            cursor.execute("DELETE FROM seasonal WHERE Code = %s", (ticker,))
            
            # Chuẩn bị dữ liệu để chèn
            trend_data = [(ticker, row[0], row[1]) for row in trend.itertuples()]
            seasonal_data = [(ticker, row[0], row[1]) for row in seasonal.itertuples()]
            
            # Chèn dữ liệu mới vào bảng 'trend' và 'seasonal'
            trend_sql = "INSERT INTO trend (Code, trend, datetime) VALUES (%s, %s, %s)"
            seasonal_sql = "INSERT INTO seasonal (Code, seasonal, datetime) VALUES (%s, %s, %s)"
            
            cursor.executemany(trend_sql, trend_data)
            cursor.executemany(seasonal_sql, seasonal_data)
            
            # Lưu thay đổi vào cơ sở dữ liệu
            connection.commit()
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Đóng kết nối
        connection.close()

def saveCorrelationData():
    connection = connect_to_db()
    if connection is None:
        return None
    
    try:
        df = df_base.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
    # Lọc dữ liệu theo mã cổ phiếu (code)
            df = df[df['code'] == ticker].copy()
            df['datetime'] = pd.to_datetime(df['datetime'])
            df["close"] = pd.to_numeric(df["close"])

            # Tạo một bản sao của df để tính toán các cột bổ sung
            corr_df = df.copy()
            
            # Thêm các cột mới
            corr_df['Open-High'] = corr_df['open'] - corr_df['high']
            corr_df['Open-Low'] = corr_df['open'] - corr_df['low']
            corr_df['Close-High'] = corr_df['close'] - corr_df['high']
            corr_df['Close-Low'] = corr_df['close'] - corr_df['low']
            corr_df['High-Low'] = corr_df['high'] - corr_df['low']
            corr_df['Open-Close'] = corr_df['open'] - corr_df['close']

            # Tính toán ma trận tương quan và bỏ các cột không cần thiết
            corr_df2 = corr_df.drop(['index', 'id', 'datetime', 'open', 'high', 'low', 'close', 'code', 'volume'], axis=1)
            corr = corr_df2.corr()

            # Thêm cột 'Code' vào mỗi dòng trong ma trận tương quan
            corr_data = pd.DataFrame(corr)
            corr_data['Code'] = ticker  # Thêm cột Code với giá trị là 'code'

            # Chuyển ma trận tương quan thành dạng list để insert vào cơ sở dữ liệu
            corr_data_list = [
                (row['Code'], row['Open-High'], row['Open-Low'], row['Close-High'],row['Close-Low'], row['High-Low'], row['Open-Close'])
                for  row in corr_data.iterrows()
            ]

            # Tạo kết nối với cơ sở dữ liệu
            cursor = connection.cursor()

            # Xóa dữ liệu cũ liên quan đến 'code'
            cursor.execute("DELETE FROM correlation_matrix WHERE Code = %s", (ticker,))

            # Câu lệnh SQL để chèn dữ liệu vào bảng correlation_matrix
            corr_sql = """
                INSERT INTO correlation_matrix (Code, `Open-High`, `Open-Low`, `Close-High`,`Close-Low`, `High-Low`, `Open-Close`) 
                VALUES (%s, %s, %s, %s, %s, %s,%s)
            """

            # Thực thi câu lệnh SQL để lưu dữ liệu
            cursor.executemany(corr_sql, corr_data_list)

            # Lưu thay đổi vào cơ sở dữ liệu
            connection.commit()
            print(f"Successfully saved correlation data for code: {ticker}")

    except Exception as e:
        print(f"Error occurred while saving correlation data: {e}")
    finally:
        # Đóng kết nối
        connection.close()


def saveClusterData():
    connection = connect_to_db()
    if connection is None:
        return None
    
    try: 
        df = df_base.copy()
        connection = connect_to_db()
        if connection is None:
            return None
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            df = df[df['code'] == ticker].copy()
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
                        "Code" :ticker, 
                        "index": index,
                        "volume": row['volume'],
                        "season": i
                    })
            scatter_df = pd.DataFrame(scatter_data)
            cursor = connection.cursor()
            delete_sql = "DELETE FROM scatter_data_trend WHERE Code = %s"  # Make sure 'Code' is the identifier
            cursor.execute(delete_sql, (ticker,))
            
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
    except Exception as e:
        print(f"Error occurred while saving correlation data: {e}")
    finally:
        # Đóng kết nối
        connection.close()
        
def saveArimaPredictData():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            model = joblib.load(f'model/arima/arima_model_{ticker}.pkl')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle

            # Dự đoán giá cổ phiếu trong 1 ngày
            forecast_days = 1

            # Dự đoán giá cổ phiếu
            forecast = model.forecast(steps=forecast_days)
        
            cursor = connection.cursor()
            cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (ticker,))
            actual_value = cursor.fetchone()
            
            rmse = np.sqrt(np.mean((np.array(actual_value) - np.array(forecast))**2))
            
            delete_sql = "DELETE FROM predictions_arima WHERE Code = %s"  # Make sure 'Code' is the identifier
            cursor.execute(delete_sql, (ticker,))
            
            
            # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
            sql = """
                INSERT INTO predictions_arima
                VALUES (%s, %s, %s)
                """
            print(forecast[0])
            # Thực thi câu lệnh SQL với dữ liệu từ scatter_df
            cursor.execute(sql, (forecast[0],rmse,ticker ))
            
            # Commit để lưu thay đổi vào cơ sở dữ liệu
            connection.commit()
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveArimaPredictData7():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            model = joblib.load(f'model/arima/arima_model_{ticker}.pkl')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle
            # Dự đoán giá cổ phiếu trong 1 ngày
            forecast_days = 7

            # Dự đoán giá cổ phiếu
            forecast = model.forecast(steps=forecast_days)
        
            cursor = connection.cursor()
            
            
            delete_sql = "DELETE FROM forecast_result WHERE Code = %s"  # Make sure 'Code' is the identifier
            cursor.execute(delete_sql, (ticker,))
            
            
            # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
            sql = """
                INSERT INTO forecast_result
                VALUES (%s, %s)
                """
            
            forecast = forecast.values.tolist()
            forecast = [
                (ticker, row[0])
                for _, row in forecast.iterrows()
            ]
            cursor.executemany(sql, forecast)
            
            # Commit để lưu thay đổi vào cơ sở dữ liệu
            connection.commit()

                
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveLstmPredictData():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        df = df_base.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            model = joblib.load(f'model/lstm/lstm_model_{ticker}.h5')  # Hoặc sử dụng pickle.load() nếu bạn sử dụng pickle
            df = df[df['code'] == ticker].copy()
            # Chuyển dữ liệu thành dạng phù hợp cho mô hình
            scaler = MinMaxScaler(feature_range=(0, 1))
            df['Close'] = scaler.fit_transform(df['Close'].values.reshape(-1, 1))

            # Tạo dữ liệu đầu vào cho mô hình từ những giá trị trước đó (các giá trị cuối cùng)
            time_step = 60
            data_input = df['Close'].values[-time_step:].reshape(1, time_step, 1)

            # Dự đoán giá cổ phiếu
            predicted_price = model.predict(data_input)

            # Chuyển dự đoán từ chuẩn hóa về giá trị thực tế
            predicted_price = scaler.inverse_transform(predicted_price)

            cursor = connection.cursor()
            cursor.execute("SELECT close FROM newest_stock_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (ticker,))
            actual_value = cursor.fetchone()
            
            rmse = np.sqrt(np.mean((np.array(actual_value) - np.array(predicted_price))**2))
            
            delete_sql = "DELETE FROM predictions_lstm WHERE Code = %s"  # Make sure 'Code' is the identifier
            cursor.execute(delete_sql, (ticker,))
            
            
            # Câu lệnh SQL để chèn dữ liệu vào bảng 'scatter_data_trend'
            sql = """
                INSERT INTO predictions_lstm
                VALUES (%s, %s, %s)
                """
            cursor.execute(sql, (predicted_price[0],rmse,ticker ))
            # Commit để lưu thay đổi vào cơ sở dữ liệu
            connection.commit()

                
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        connection.close()
        
def saveLinearPredictData():
    try:
        connection = connect_to_db()
        if connection is None:
            print("Database connection failed.")
            return None
        df = df_base.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            with connection.cursor() as cursor:
                # Query the latest stock data for predictions
                cursor.execute("""
                    SELECT open, high, low, volume, close 
                    FROM stocks_data 
                    WHERE code = %s 
                    ORDER BY datetime DESC 
                    LIMIT 1
                """, (ticker,))
                actual_values = cursor.fetchall()

                # Check if data is available
                if not actual_values:
                    print(f"No data found for code: {ticker}")
                    return

                # Convert database data to DataFrame
                column_names = ['open', 'high', 'low', 'volume', 'close']
                df = pd.DataFrame(actual_values, columns=column_names)

                # Reverse to ensure chronological order (if needed)
                df = df.iloc[::-1]

                # Load the saved Linear Regression model
                model_path = f'model/linear/linear_regression_stock_model_{ticker}.pkl'
                try:
                    model = joblib.load(model_path)
                except FileNotFoundError:
                    print(f"Model file not found at: {model_path}")
                    return

                # Initialize predictions and RMSE lists
                predictions = []
                rmse_list = []

                # Prepare the input for prediction
                X = df[['close']].iloc[-1:].values  # Use only the most recent 'close' value
                y_actual = df['close'].iloc[-1]    # Get the actual close value for RMSE

                # Perform the prediction
                try:
                    y_pred = model.predict(X)[0]
                except Exception as e:
                    print(f"Prediction failed: {e}")
                    return

                predictions.append(y_pred)

                # Calculate RMSE for the prediction
                rmse = np.sqrt((y_actual - y_pred) ** 2)
                rmse_list.append(rmse)

                # Delete old predictions for this code
                delete_sql = "DELETE FROM predictions_lr WHERE Code = %s"
                cursor.execute(delete_sql, (ticker,))

                # Insert new prediction and RMSE into the database
                insert_sql = """
                    INSERT INTO predictions_lr (Prediction, RMSE, Code) 
                    VALUES (%s, %s, %s)
                """
                cursor.execute(insert_sql, (y_pred, rmse, ticker))

                # Commit the changes
                connection.commit()
                print(f"Prediction saved: {y_pred}, RMSE: {rmse}, Code: {ticker}")

    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Ensure the connection is closed
        if connection:
            connection.close()

def saveVolumePerMonthData():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        df = df_base.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
    # Lọc dữ liệu theo code và chuẩn hóa cột
            df_code = df[df['code'] == ticker].copy()
            df_code['datetime'] = pd.to_datetime(df_code['datetime'])
            df_code['month'] = df_code['datetime'].dt.strftime('%b')  # Lấy tháng (Jan, Feb, ...)
            df_code['year'] = df_code['datetime'].dt.year  # Lấy năm

            # Tổng khối lượng theo từng năm-tháng
            grouped = df_code.groupby(['year', 'month'])['volume'].sum().reset_index()

            # Chuyển đổi cột 'year' từ numpy.int64 sang int
            grouped['year'] = grouped['year'].astype(int)
            # Chuyển đổi cột 'year' từ numpy.int64 sang int

            # Lưu dữ liệu vào CSV 
            csv_data = []

            for year in grouped['year'].unique():
                year_data = grouped[grouped['year'] == year]
                for month, volume in zip(year_data['month'], year_data['volume']):
                    csv_data.append({'year': year, 'month': month, 'volume': volume})

            # Chuyển danh sách thành DataFrame
            csv_df = pd.DataFrame(csv_data)
            csv_df['Code'] = ticker  # Thêm cột Code với giá trị là 'code'

        # Chuyển ma trận tương quan thành dạng list để insert vào cơ sở dữ liệu
            volume_data_list = [
                (row['Code'], row['year'], row['month'], row['vloume'])
                for  row in volume_data_list.iterrows()
            ]

            cursor = connection.cursor()
            
            # Xóa dữ liệu cũ của mã 'code'
            cursor.execute("DELETE FROM yearly_volumes WHERE Code = %s", (ticker,))
            
            
            # Chèn dữ liệu mới vào bảng 'trend' và 'seasonal'
            volume_sql = "INSERT INTO yearly_volumes (Code, year, month, volume) VALUES (,%s,%s, %s, %s)"
            
            cursor.executemany(volume_sql, volume_data_list)
            
            # Lưu thay đổi vào cơ sở dữ liệu
            connection.commit()
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Đóng kết nối
        connection.close()
def saveTwitterData():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        df = twit.copy()
        tickers = ["AAPL", "AMZN", "GOOG"]
        for index, ticker in enumerate(tickers):
            tweet_list = []  # Danh sách các tweet cùng với polarity
            global_polarity = 0  # Polarity của tất cả tweet (tổng của các polarity từng tweet)
            tw_list = []  # Danh sách các tweet chỉ chứa văn bản
            pos = 0  # Số lượng tweet tích cực
            neg = 1  # Số lượng tweet tiêu cực
            neutral = 0  # Số lượng tweet trung lập

            # Giả sử cột 'tweet_text' chứa văn bản tweet
            tweets = df['tweet'].head(10000*index).values

            # Đọc và xử lý từng tweet
            for tweet in tweets:
                # Làm sạch tweet
                tw = tweet
                tw = re.sub('&amp;', '&', tw)  # Thay thế '&amp;' bằng '&'
                tw = re.sub(':', '', tw)  # Loại bỏ dấu ":"
                tw = tw.encode('ascii', 'ignore').decode('ascii')  # Loại bỏ emoji và ký tự không phải ASCII

                # Tính toán polarity của tweet bằng TextBlob
                blob = TextBlob(tw)
                polarity = 0  # Polarity của tweet
                for sentence in blob.sentences:
                    polarity += sentence.sentiment.polarity
                    if polarity > 0:
                        pos += 1  # Nếu polarity > 0, tweet là tích cực
                    if polarity < 0:
                        neg += 1  # Nếu polarity < 0, tweet là tiêu cực
                    if polarity == 0:
                        neutral += 1  # Nếu polarity == 0, tweet là trung lập

                    global_polarity += sentence.sentiment.polarity

                # Thêm tweet và polarity vào danh sách tweet_list
                tweet_list.append({'tweet': tw, 'polarity': polarity})
                tw_list.append(tw)  # Lưu tweet dưới dạng văn bản để hiển thị trên web
                
            df_tweet_data = pd.DataFrame(tweet_list)
            df_tweet_data['Code'] = ticker 
            # Xóa dữ liệu cũ của mã 'code'
            df_tweet_data = [
                (row['Code'], row['year'], row['month'], row['vloume'])
                for  row in df_tweet_data.iterrows()
            ]

            cursor = connection.cursor()
            
            # Xóa dữ liệu cũ của mã 'code'
            cursor.execute("DELETE FROM process_tweet_data WHERE Code = %s", (ticker,))
            
            
            # Chèn dữ liệu mới vào bảng 'trend' và 'seasonal'
            volume_sql = "INSERT INTO process_tweet_data (Code, tweet, polarity) VALUES (%s, %s, %s)"
            
            cursor.executemany(volume_sql, df_tweet_data)
            
            
            # Lưu thay đổi vào cơ sở dữ liệu
            connection.commit()
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Đóng kết nốiS
        connection.close()

scheduler = BackgroundScheduler()
scheduler.add_job(func=loadData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveTrendSeasonData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveCorrelationData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveClusterData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveArimaPredictData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveArimaPredictData7, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveLstmPredictData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveLinearPredictData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=saveVolumePerMonthData, trigger="interval", hours=12)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=loadTwit, trigger="interval", hours=1)  # In dữ liệu mỗi 5 giây
scheduler.add_job(func=saveTwitterData, trigger="interval", hours=1)  # In dữ liệu mỗi 5 giây
# scheduler.add_job(func=saveArimaPredictData, trigger="interval", seconds=10)  # In dữ liệu mỗi 5 giây
scheduler.start()
if __name__ == '__main__':
    try:
        # Đảm bảo rằng ứng dụng Flask không thoát khi chạy
        app.run(debug=True, use_reloader=False, port=6000)
    except (KeyboardInterrupt, SystemExit):
        pass

    