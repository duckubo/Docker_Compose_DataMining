import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const ClusterChart = () => {
    const [clusterData, setClusterData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/get-cluster-data')
            .then(response => {
                setClusterData(response.data);
            })
            .catch(error => {   
                console.error('Có lỗi khi lấy dữ liệu:', error);
            });
    }, []);

    // Màu sắc cho từng cụm
    const colors = ['red', 'blue', 'green', 'orange'];

    // Tạo danh sách tên cụm duy nhất cho legend
    const seasonNames = new Set();
    const plotData = [];

    // Duyệt qua dữ liệu để nhóm theo từng cụm và chỉ thêm tên vào legend khi chưa có
    clusterData.forEach(item => {
        const seasonName = item.season === 0 ? 'Winter' :
            item.season === 1 ? 'Fall' :
                item.season === 2 ? 'Summer' : 'Spring';

        // Nếu tên mùa chưa có trong legend thì thêm vào
        if (!seasonNames.has(seasonName)) {
            seasonNames.add(seasonName);
            plotData.push({
                x: clusterData.filter(i => i.season === item.season).map(i => new Date(i.index)),  // Tạo danh sách thời gian cho mỗi cụm
                y: clusterData.filter(i => i.season === item.season).map(i => i.temperature),
                type: 'scatter',
                mode: 'markers',
                marker: { color: colors[item.season], size: 12 },
                name: seasonName,  // Hiển thị tên cụm
            });
        }
    });

    return (
        <div>
            <h2>Biểu đồ phân cụm theo nhiệt độ</h2>
            <Plot
                data={plotData}
                layout={{
                    title: 'Biểu đồ nhiệt độ theo thời gian',
                    xaxis: {
                        title: 'Thời gian',
                        type: 'date',  // Đảm bảo rằng trục x là loại date
                    },
                    yaxis: { title: 'Nhiệt độ' },
                    showlegend: true,  // Hiển thị legend
                    width: 2000,  // Chiều rộng biểu đồ
                    height: 1000, // Chiều cao biểu đồ
                }}
            />
        </div>
    );
};

export default ClusterChart;
