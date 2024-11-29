import Plot from 'react-plotly.js';

const TimeSeriesChart1M = ({ data, ticker }) => {
    return (
        <Plot
            data={[
                {
                    x: data.map(item => item.name),
                    y: data.map(item => item.close),
                    type: 'scatter',
                    mode: 'lines',
                    line: { shape: 'spline' }
                }
            ]}
            layout={{
                title: `Minutes Data Analysis ${ticker}`,
                xaxis: {
                    title: 'Minutes',
                    tickmode: 'auto',   // Tự động phân phối nhãn trục x
                    nticks: 10
                },
                yaxis: { title: '_Price' },
                width: 500,
                height: 500,
            }}
        />
    );
};

export default TimeSeriesChart1M;
