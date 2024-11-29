import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const SentimentChart = ({ ticket, onValueChange }) => {
    const [posCount, setPosCount] = useState(0);
    const [negCount, setNegCount] = useState(0);
    const [neutralCount, setNeutralCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/tweet-data?ticket=${ticket}`);
                const data = await response.json();

                // Nếu không có dữ liệu, không cần thực hiện các phép tính tiếp theo
                if (!data || data.length === 0) {
                    console.warn('No data available for sentiment analysis');
                    return;
                }

                let polarity = 0, pos = 0, neg = 0, neutral = 0;

                // Đếm số lượng tweet Positive, Negative và Neutral
                data.forEach(item => {
                    if (item.polarity > 0) {
                        pos++;
                    } else if (item.polarity < 0) {
                        neg++;
                    } else {
                        neutral++;
                    }
                    polarity += item.polarity;
                });

                const global_polarity = polarity / data.length;

                // Cập nhật giá trị cho parent component qua onValueChange
                onValueChange(global_polarity);

                // Cập nhật state cho các giá trị cảm xúc
                setPosCount(pos);
                setNegCount(neg);
                setNeutralCount(neutral);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Gọi hàm fetchData mỗi khi ticket thay đổi
        fetchData();
    }, [ticket]); // Thêm ticket vào dependencies để tránh gọi API không cần thiết

    return (
        <div style={{ width: '300px', height: '300px' }}>
            <Plot
                data={[
                    {
                        values: [posCount, negCount, neutralCount],
                        labels: ['Positive', 'Negative', 'Neutral'],
                        type: 'pie',
                        textinfo: 'percent+label', // Hiển thị tỷ lệ phần trăm
                        text: ['Positive Tweets', 'Negative Tweets', 'Neutral Tweets'],
                        hoverinfo: 'label+percent', // Hiển thị label và phần trăm khi hover
                        marker: {
                            colors: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(153, 102, 255, 0.8)'
                            ], // Màu sắc cho từng loại sentiment
                        },
                    },
                ]}
                layout={{
                    title: 'Sentiment Analysis',
                    showlegend: true, // Hiển thị legend
                    width: 300,
                    height: 300,
                }}
            />
        </div>
    );
};

export default SentimentChart;
