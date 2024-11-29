import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
import yaml
import os
from connection import connect_to_db 
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

config_path = os.path.join(os.path.dirname(__file__), '../config/config.yml')

# Tải cấu hình từ tệp YAML để lấy thông tin API
with open(config_path, 'r') as config_file:
    config = yaml.safe_load(config_file)
    
@app.route('/api/stock-data', methods=['GET'])
def get_stock_data():
    
    ticket = request.args.get('ticket')
    # Nhận tham số 'nm' từ yêu cầu
 
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500

    try:
        with connection.cursor() as cursor:
            # Use parameterized query to prevent SQL injection
            cursor.execute("SELECT * FROM stocks_data WHERE code = %s", (ticket,))
            result = cursor.fetchall()

        # Assuming the correct column indexing is like this: 
        # datetime at index 0, open at 1, high at 2, low at 3, close at 4, volume at 5
        df = pd.DataFrame(
            result, 
            columns=["id","datetime", "open", "high", "low", "close", "volume","code"]
        )
        df = df.drop(columns=['code'])
        df['datetime'] = pd.to_datetime(df['datetime'])
        df["close"] = pd.to_numeric(df["close"])
        
        numeric_columns = ["open", "high", "low", "close", "volume"]
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')  # Thay thế giá trị không hợp lệ bằng NaN

        # Loại bỏ các dòng có giá trị NaN trong các cột số
        df = df.dropna(subset=numeric_columns)

        df.set_index('datetime', inplace=True)  # Đặt datetime làm index
        print(df.dtypes)
        weekly_resample = df.resample('W').mean()
        monthly_resample = df.resample('M').mean()

        # # # Reset lại index để có thể chuyển đổi thành dict
        df_day = df.reset_index()
        df_week = weekly_resample.reset_index()
        df_month = monthly_resample.reset_index()


        
        # Chuyển đổi dữ liệu thành định dạng JSON
        # Đảm bảo df_aapl_day, df_aapl_week, df_aapl_month luôn là DataFrame trước khi chuyển sang dict
        df_day_records = df_day.to_dict(orient='records')
        df_week_records = df_week.to_dict(orient='records')
        df_month_records = df_month.to_dict(orient='records')
        
        # Chuẩn bị dữ liệu gửi đến frontend
        response_data = {
            'df_day': df_day_records,
            'df_week': df_week_records,
            'df_month': df_month_records,
        }
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": f"Lỗi khi truy vấn cơ sở dữ liệu: {e}"}), 500
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
            

@app.route('/api/stock-info', methods=['GET'])
def stock_info():
    # Nhận tham số 'nm' từ yêu cầu
    ticket = request.args.get('ticket')
    # Nhận tham số 'nm' từ yêu cầu
 
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    # Đọc dữ liệu từ file CSV
    df = pd.read_csv('newest_stock_data.csv')

    # Lọc dữ liệu cho mã cổ phiếu tương ứng
    df_symbol = df[df['code'] == ticket].copy()

    # Chuyển đổi cột 'datetime' thành kiểu datetime
    df_symbol['datetime'] = pd.to_datetime(df_symbol['datetime'])

    # Lấy giá trị mới nhất của cột 'close'
    newest = df_symbol.to_dict(orient='records')[0]  # 
    # Sử dụng .values[0] để lấy giá trị đầu tiên từ Series
    return jsonify({
        'newest_data': newest,
    })
@app.route('/api/get-close-data', methods=['GET'])
def get_data():
    
    ticket = request.args.get('ticket')
    # Nhận tham số 'nm' từ yêu cầu
 
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    # Mở kết nối mới cho mỗi yêu cầu
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM close_data  WHERE code = %s", (ticket,))
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
@app.route('/api/get-trend-data', methods=['GET'])
def get_trend_data():
    # Lấy giá trị của ticket từ query parameter
    ticket = request.args.get('ticket')
    
    # Kiểm tra nếu ticket không được cung cấp hoặc không hợp lệ
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM trend  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        trend_data = [
            { "trend": row[1], "datetime": row[2]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 
        
        return jsonify(trend_data)  # Trả về dữ liệu dưới dạng JSON
    
    except Exception as e:
        return jsonify({"error": f"Lỗi khi truy vấn cơ sở dữ liệu: {e}"}), 500
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
    
@app.route('/api/get-seasonal-data', methods=['GET'])
def get_seasonal_data():
    # Lấy giá trị của ticket từ query parameter
    ticket = request.args.get('ticket')
    
    # Kiểm tra nếu ticket không được cung cấp hoặc không hợp lệ
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM seasonal  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        seasonal_data = [
            { "seasonal": row[1], "datetime": row[2]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 
        # Đọc dữ liệu từ file CSV
        
        
        return jsonify(seasonal_data)  # Trả về dữ liệu dưới dạng JSON
    
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 400
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
@app.route('/api/get-correlation_matrix-data', methods=['GET'])
def get_correlation_matrix_data():
    # Lấy giá trị của ticket từ query parameter
    ticket = request.args.get('ticket')
    
    # Kiểm tra nếu ticket không được cung cấp hoặc không hợp lệ
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM correlation_matrix  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        correlation_matrix = [
            { "Open-High": row[1], "Open-Low": row[2] ,"Close-High": row[3], "Close-Low": row[4],"High-Low": row[5], "Open-Close": row[6]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 
        
        return jsonify(correlation_matrix)  # Trả về dữ liệu dưới dạng JSON
    
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 400
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
@app.route('/api/get-arima-data', methods=['GET'])
def get_arima_data():
    ticket = request.args.get('ticket')
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stock_price_comparison_arima  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        arima_data = [
            { "Actual": row[1], "Predicted": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(arima_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
    
@app.route('/api/get-lstm-data', methods=['GET'])
def get_lstm_data():
    ticket = request.args.get('ticket')
    # Đọc dữ liệu từ file CSV
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stock_price_comparison_lstm  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        lstm_data = [
            { "Actual": row[1], "Predicted": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(lstm_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu

@app.route('/api/get-linear-data', methods=['GET'])
def get_linear_data():
    ticket = request.args.get('ticket')
    # Đọc dữ liệu từ file CSV
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stock_price_comparison_linear  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        linear_data = [
            { "Actual": row[1], "Predicted": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(linear_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
            
@app.route('/api/prediction-arima', methods=['GET'])
def prediction_arima():
    # Đọc dữ liệu từ file CSV
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM predictions_arima")
            result = cursor.fetchall()
        arima_data = [
            {"Prediction":row[0], "RMSE": row[1], "Code": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(arima_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data  not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
    

@app.route('/api/prediction-lstm', methods=['GET'])
def prediction_lstm():
    # Đọc tệp CSV
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM predictions_lstm")
            result = cursor.fetchall()
        lstm_data = [
            {"Prediction":row[0], "RMSE": row[1], "Code": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(lstm_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data  not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu

@app.route('/api/prediction-lr', methods=['GET'])
def prediction_lr():
    # Đọc tệp CSV
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM predictions_lr")
            result = cursor.fetchall()
        linear_data = [
            {"Prediction":row[0], "RMSE": row[1], "Code": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(linear_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data  not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
@app.route('/api/tweet-data', methods=['GET'])
def get_tweet_data():
    
    ticket = request.args.get('ticket')
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM processed_tweet_data  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        tweet_data = [
            { "tweet": row[1], "polarity": row[2] }  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        # Trả về dữ liệu dưới dạng JSON
        return jsonify(tweet_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu

@app.route('/api/get-forecast', methods=['GET'])
def get_forecast():
    ticket = request.args.get('ticket')
    # Nhận tham số 'nm' từ yêu cầu
 
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM forecast_results  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        forecast_results = [
            { "Forecasted Value": row[1]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 
        
        return jsonify(forecast_results)  # Trả về dữ liệu dưới dạng JSON
    
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
            
@app.route('/api/monthly-volume', methods=['GET'])
def get_monthly_volume():
    
    ticket = request.args.get('ticket')
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM yearly_volumes  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        monthly_volume = [
            { "year": row[1],  "month": row[2], "volume": row[3]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(monthly_volume)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu      
    
@app.route('/api/get-cluster-data-trend', methods=['GET'])
def get_cluster_datatrend():
    # Đọc dữ liệu từ file CSV
    ticket = request.args.get('ticket')
    
    # Kiểm tra nếu ticket không được cung cấp hoặc không hợp lệ
    if not ticket:
        return jsonify({'error': 'No stock symbol (ticket) provided'}), 400
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM scatter_data_trend  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        cluster_data = [
            { "index": row[1],"volume": row[2],"season": row[3]}  # Giả sử cấu trúc bảng là như thế này
            for row in result
        ] 

        return jsonify(cluster_data)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu

@app.route('/api/get-season-counts-trend', methods=['GET'])
def get_season_counts_trend():
    # Đọc dữ liệu từ file CSV
    ticket = request.args.get('ticket')
    
    connection = connect_to_db()
    if connection is None:
        return jsonify({"error": "Không thể kết nối đến cơ sở dữ liệu"}), 500
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM scatter_data_trend  WHERE Code = %s", (ticket,))
            result = cursor.fetchall()
        df = pd.DataFrame(
            result, 
            columns=["Code","index", "volume", "season"]
        )
        df = df.drop(columns=['Code'])
        # Chuyển đổi cột 'index' thành định dạng chuỗi để JSON hóa
        df['index'] = pd.to_datetime(df['index']).dt.strftime('%Y-%m-%d')
        df['year'] = pd.to_datetime(df['index']).dt.year  # Đảm bảo cột 'year' được tạo đúng
        df['season'] = df['season'].map({0: 'Low', 1: 'High', 2: 'Average',3:'Spike', 4:'Ultra_High', 5:'VeryLow'})

        # Tính số ngày trong từng mùa cho mỗi năm
        season_counts = df.groupby(['year', 'season']).size().unstack(fill_value=0)
        # Chuyển đổi dữ liệu thành JSON
        season_counts = season_counts.reset_index()
        season_counts = season_counts.to_dict(orient='records')

        return jsonify(season_counts)  # Trả về dữ liệu dưới dạng JSON
    except FileNotFoundError:
        return jsonify({'error': f'Data for {ticket} not found'}), 404
    finally:
        if connection and connection.open:
            connection.close()  # Đảm bảo rằng kết nối được đóng sau mỗi yêu cầu
            
if __name__ == '__main__':
    app.run(host=config['api']['host'], port=config['api']['port'])