import React, { useEffect, useState } from 'react';

const EmbedWidgetMarketOverview = ({ ticket }) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme: "light",
            dateRange: "12m",
            showChart: true,
            locale: "in",
            timezone: "Asia/Ho_Chi_Minh",
            largeChartUrl: "",
            isTransparent: false,
            height: "250",
            width: "620",
            plotLineColorGrowing: "rgba(25, 118, 210, 1)",
            plotLineColorFalling: "rgba(25, 118, 210, 1)",
            gridLineColor: "rgba(42, 46, 57, 1)",
            scaleFontColor: "rgba(120, 123, 134, 1)",
            belowLineFillColorGrowing: "rgba(33, 150, 243, 0.12)",
            belowLineFillColorFalling: "rgba(33, 150, 243, 0.12)",
            symbolActiveColor: "rgba(33, 150, 243, 0.12)",
            tabs: [
                {
                    title: "Indices",
                    symbols: [
                        { s: `NASDAQ:${ticket}`, d: `${ticket}` },
                    ],
                    originalTitle: "Indices"
                }
            ]
        });

        document.getElementsByClassName('tradingview-widget-container_overview')[0].appendChild(script);
    }, [ticket]);

    return (
        <div className="tradingview-widget-container_overview" style={{ display: 'flex' }}>
        </div>
    );
};
export default EmbedWidgetMarketOverview;