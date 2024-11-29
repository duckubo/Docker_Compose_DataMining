import React, { useState, useEffect } from 'react';

const StockInfo = ({ ticket }) => {
    const [stockData, setStockData] = useState({
        open: '0.00',
        high: '0.00',
        low: '0.00',
        close: '0.00',
        volume: '0',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Bắt đầu trạng thái loading
                const response = await fetch(`http://localhost:5000/api/stock-info?ticket=${ticket}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.newest_data) {
                        setStockData({
                            open: data.newest_data.open || '0.00',
                            high: data.newest_data.high || '0.00',
                            low: data.newest_data.low || '0.00',
                            close: data.newest_data.close || '0.00',
                            volume: data.newest_data.volume || '0',
                        });
                    }
                } else {
                    console.error('Error fetching stock data:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false); // Kết thúc trạng thái loading
            }
        };

        fetchData();
    }, [ticket]);

    if (loading) {
        return <p>Loading stock data...</p>; // Hiển thị loading nếu dữ liệu chưa sẵn sàng
    }

    return (
        <div className="stock-info" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['open', 'high', 'low', 'close', 'volume'].map((key, index) => {
                const colors = ['#007bff', '#ffc107', '#28a745', '#dc3545', '#6c757d'];
                return (
                    <div
                        key={key}
                        className="info-box"
                        style={{
                            backgroundColor: colors[index],
                            padding: '10px',
                            borderRadius: '5px',
                            flex: '1',
                        }}
                    >
                        <h2 style={{ color: '#fff', margin: 0 }}>{stockData[key]}</h2>
                        <p style={{ color: '#fff', margin: 0 }}>{key.toUpperCase()}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default StockInfo;
