import Chart from '../../components/chart/Chart';
import { useEffect, useMemo, useState } from 'react';
import './statistics.css'
import RadarChartPlot2 from '../../components/chart/RadarChartPlot2';
import ScatterPlot2 from '../../components/chart/ClusterChart2';
import SpiderChart2 from '../../components/chart/SpiderChart2';
export default function Statistics() {

    return (
        <div className='statistics'>
           
            <div style={{ display: 'flex' }}>
                <ScatterPlot2 />
                <SpiderChart2 />
            </div>
            <RadarChartPlot2 />
        </div>
    );
}
