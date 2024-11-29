import React, { useEffect, useState } from 'react';

const EmbedWidgetMarketOverview = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme: "dark",
            dateRange: "12m",
            showChart: true,
            locale: "in",
            largeChartUrl: "",
            isTransparent: false,
            height: "600",
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
                        { s: "NASDAQ:AAPL", d: "AAPL" },
                        { s: "NASDAQ:GOOG" },
                        { s: "NASDAQ:AMZN" },
                        { s: "BSE:HDFCBANK" },
                        { s: "BSE:TATAMOTORS" },
                        { s: "BSE:ICICIBANK" },
                        { s: "NASDAQ:MSFT" },
                        { s: "NYSE:JPM" },
                        { s: "NASDAQ:FB" },
                        { s: "NYSE:TWTR" },
                        { s: "BSE:ZEEL", d: "ZEEL" },
                        { s: "BSE:NTPC" },
                        { s: "BSE:COALINDIA" },
                        { s: "BSE:YESBANK" },
                        { s: "BSE:IDEA" },
                        { s: "BSE:SBIN" },
                        { s: "BSE:INDUSINDBK" }
                    ],
                    originalTitle: "Indices"
                }
            ]
        });

        document.getElementsByClassName('tradingview-widget-container_overview')[0].appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container_overview" style={{ width: '20%' }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};
export default EmbedWidgetMarketOverview;