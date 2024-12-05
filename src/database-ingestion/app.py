import requests
from mysql.connector import Error
from datetime import datetime
from connection import connect_to_db 
from flask import Flask, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler
import pandas as pd
app = Flask(__name__)
def fetch_data(ticker):
    api_key = 'e4ee6d020dab406ba8a901400da6d0a8'
    ticker = ticker
    url = "https://api.twelvedata.com/time_series?"

    params = {
        'symbol': ticker,
        'interval': '1day',
        'apikey': api_key,
        'outputsize': 30,
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if "values" in data:
            return data  # Return the fetched data
        else:
            print("No valid data received from API.")
            return None
    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None
def fetch_data_newest(ticker):
    api_key = 'e4ee6d020dab406ba8a901400da6d0a8'
    ticker = ticker
    url = "https://api.twelvedata.com/time_series?"

    params = {
        'symbol': ticker,
        'interval': '5min',
        'apikey': api_key,
        'outputsize': 1,
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if "values" in data:
            return data  # Return the fetched data
        else:
            print("No valid data received from API.")
            return None
    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None
def fetch_twit():
    connection = connect_to_db()
    if connection is None:
        return None
    try:
        url = "https://raw.githubusercontent.com/dD2405/Twitter_Sentiment_Analysis/master/train.csv"

        df = pd.read_csv(url)
        
        cursor = connection.cursor()
        insert_query = """
        INSERT INTO tweets (label, tweet) VALUES (%s, %s)
        """

        # Duyệt qua từng dòng dữ liệu và chèn vào cơ sở dữ liệu
        data_to_insert = [(int(row['label']), row['tweet']) for _, row in df.iterrows()]
        cursor.executemany(insert_query, data_to_insert)

        # Commit thay đổi
        connection.commit()

        print(f"{cursor.rowcount} rows inserted into the database.")
    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
def save_to_db(ticker, datetime_str, open_price, high_price, low_price, close_price, volume):
    
    connection = connect_to_db()
    if connection is None:
        return None

    try:
        cursor = connection.cursor()
        sql = """
        INSERT INTO stocks_data (code, datetime, open, high, low, close, volume)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        val = (ticker, datetime_str, float(open_price), float(high_price), float(low_price), float(close_price), int(volume))
        cursor.execute(sql, val)
        connection.commit()
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        cursor.close()
        connection.close()
def save_to_db_newest(ticker, datetime_str, open_price, high_price, low_price, close_price, volume):
    
    connection = connect_to_db()
    if connection is None:
        return None

    try:
        cursor = connection.cursor()
        sql = """
        INSERT INTO newest_stock_data (code, datetime, open, high, low, close, volume)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        val = (ticker, datetime_str, float(open_price), float(high_price), float(low_price), float(close_price), int(volume))
        cursor.execute(sql, val)
        connection.commit()
    except Error as e:
        print(f"Error saving to database: {e}")
    finally:
        cursor.close()
        connection.close()
def get_latest_datetime(ticker):
    
    connection = connect_to_db()
    if connection is None:
        return None

    cursor = connection.cursor()
    cursor.execute("SELECT datetime FROM stocks_data WHERE code = %s ORDER BY datetime DESC LIMIT 1", (ticker,))
    latest = cursor.fetchone()
    cursor.close()
    connection.close()
    print(latest[0])
    return latest[0] if latest else None

def check_for_new_posts(ticker, data):
    latest_datetime = get_latest_datetime(ticker)
    latest_datetime=datetime.strptime(latest_datetime, '%Y-%m-%d')
    if data and "values" in data:
        new_data = []
        for entry in data["values"]:
            datetime_str = entry["datetime"]
            datetime_obj = datetime.strptime(datetime_str, '%Y-%m-%d')
            formatted_datetime = datetime_obj.strftime('%Y-%m-%d')

            # Only insert new data if the datetime is greater than the latest in the database
            if latest_datetime is None or formatted_datetime > latest_datetime.strftime('%Y-%m-%d'):
                save_to_db(ticker, formatted_datetime, entry["open"], entry["high"], entry["low"], entry["close"], entry["volume"])
                new_data.append(datetime_str)
        return new_data
    else:
        print("No valid data fetched from API.")
        return None
def save_newest_info():
    tickers = ["AAPL", "AMZN", "GOOG"]
    for ticker in tickers:
        data = fetch_data_newest(ticker)
        newest_data=data["values"][0]
        print(newest_data)
        datetime_str = newest_data["datetime"]
        datetime_obj = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
        print(datetime_obj)
        save_to_db_newest(ticker, datetime_obj, newest_data["open"], newest_data["high"], newest_data["low"], newest_data["close"], newest_data["volume"])
def save_newest_data():
    tickers = ["AAPL", "AMZN", "GOOG"]
    for ticker in tickers:
        data = fetch_data(ticker)
        if data:
            new_data = check_for_new_posts(ticker, data)
            if new_data:
                print("New data saved for the following datetimes:")
                for datetime_str in new_data:
                    print(datetime_str)
            else:
                print("No new data found.")
        else:
            print("No data fetched.")
def save_newest_twit():
    fetch_twit()
        
scheduler = BackgroundScheduler()

scheduler.add_job(func=save_newest_info, trigger="interval", minutes=5)  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=save_newest_data, trigger="interval", hours=12,next_run_time=datetime.now())  # Lấy dữ liệu mỗi 5 giây
scheduler.add_job(func=save_newest_twit, trigger="interval", hours=1)  # Lấy dữ liệu mỗi 5 giây
# scheduler.add_job(func=saveArimaPredictData, trigger="interval", seconds=10)  # In dữ liệu mỗi 5 giây
scheduler.start()
if __name__ == '__main__':
    try:
        # Đảm bảo rằng ứng dụng Flask không thoát khi chạy
        app.run(debug=True, use_reloader=False, port=6100)
    except (KeyboardInterrupt, SystemExit):
        pass
