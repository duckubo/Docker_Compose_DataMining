import './home.css';
import EmbedWidgetTickerTape from '../../components/embed/EmbedWidgetTickerTape';
import EmbedWidgetMarketQuotes from '../../components/embed/EmbedWidgetMarketQuotes';
import EmbedWidgetMarketOverview from '../../components/embed/EmbedWidgetMarketOverview';
import EmbedWidgetScreener from '../../components/embed/EmbedWidgetScreener';
import BackgroundVideoEmbed from '../../components/embed/BackgroundVideoEmbed';

export default function Home() {

  return (
    <div className='home' >
      <div style={{ position: 'relative', top: '200px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '70px' }}>STOCK MARKET PREDICTION</h1>
        <span style={{ fontSize: '25px' }}>WELCOME TO THE FUTURE OF INVESTING!</span>
      </div>
      <BackgroundVideoEmbed />
      <EmbedWidgetTickerTape />
      <div style={{ display: 'flex' }}>
        <EmbedWidgetMarketQuotes style={{ width: '80%' }} />
        <EmbedWidgetMarketOverview style={{ width: '20%' }} />
      </div>
      <EmbedWidgetScreener />
    </div>
  );
}