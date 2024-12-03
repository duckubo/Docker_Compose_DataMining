import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const ClusterChart = ({ ticket }) => {
    const [clusterData, setClusterData] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/get-cluster-data-trend?ticket=${ticket}`)
            .then(response => {
                setClusterData(response.data);
            })
            .catch(error => {
                console.error('Có lỗi khi lấy dữ liệu:', error);
            });
    }, [ticket]);

    // Màu sắc cho từng cụm
    const colors = ['red', 'blue', 'green', 'purple', 'yellow', 'brown'];

    // Tạo danh sách tên cụm duy nhất cho legend
    const seasonNames = new Set();
    const plotData = [];

    // Duyệt qua dữ liệu để nhóm theo từng cụm và chỉ thêm tên vào legend khi chưa có
    clusterData.forEach(item => {
        const seasonName = item.season === 0 ? 'Low Volume' :
            item.season === 1 ? 'High Volume' :
                item.season === 2 ? 'Average Volume' :
                    item.season === 3 ? 'Spike Volume' :
                        item.season === 4 ? 'Ultra-High Volume' : 'Very Low Volume';
        // Nếu tên mùa chưa có trong legend thì thêm vào
        if (!seasonNames.has(seasonName)) {
            seasonNames.add(seasonName);
            plotData.push({
                x: clusterData.filter(i => i.season === item.season).map(i => new Date(i.index)),  // Tạo danh sách thời gian cho mỗi cụm
                y: clusterData.filter(i => i.season === item.season).map(i => i.volume),
                type: 'scatter',
                mode: 'markers',
                marker: { color: colors[item.season], size: 12 },
                name: seasonName,  // Hiển thị tên cụm
            });

        }
    });
    return (
        <div>
            <h3>Biểu đồ phân cụm theo khối lượng giao dịch</h3>
            <Plot
                data={plotData}
                layout={{
                    title: 'Biểu đồ khối lượng giao dịch theo thời gian',
                    xaxis: {
                        title: 'Time',
                        type: 'date',  // Đảm bảo rằng trục x là loại date
                    },
                    yaxis: { title: 'Volume' },
                    showlegend: true,  // Hiển thị legend
                    width: 600,  // Chiều rộng biểu đồ
                    height: 400, // Chiều cao biểu đồ
                }}
            />
        </div>
    );
};

export default ClusterChart;
