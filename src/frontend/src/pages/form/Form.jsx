import React, { useState } from 'react';
import './form.css';
import Tile from '../../assets/images/tile7.png'
import { useHistory } from 'react-router-dom';
const Form = () => {
    const [stockSymbol, setStockSymbol] = useState('');
    const [notFound, setNotFound] = useState(false);
    const history = useHistory();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stockSymbol) {
            setNotFound(true);
            return;
        }
        const isValidSymbol = validateStockSymbol(stockSymbol);
        if (!isValidSymbol) {
            setNotFound(true);
        } else {
            setNotFound(false);
            // Chuyển hướng sang trang Predict với mã cổ phiếu (stockSymbol)
            history.push(`/predict/${stockSymbol}`);
        }
    };

    const validateStockSymbol = (symbol) => {
        const validSymbols = ['AAPL', 'GOOG', 'MSFT', 'META','AMZN'];

        // Kiểm tra nếu mã cổ phiếu có trong danh sách hợp lệ
        return validSymbols.includes(symbol.toUpperCase()); 
    };

    return (
        <div className='form'>
            {/* Header Section */}
            <div id="home" className="bg-inner low-back-gradient-inner">
                <div className="text-con-inner low-back-up">
                    <div className="">
                        <div style={{ paddingTop: '40px', textAlign: 'center' }} className="row">
                            <div className="lead col-lg-12 col-xm-12 text-center">
                                <h1><span className="top-heading-inner">PREDICT THE FUTURE</span></h1>
                                <div className="list-o-i white">
                                    <p className="white no-p"></p>
                                    <div className="pagenation_links"><a href="index.html" className="yellow"><br /></a><i> </i></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Section */}
            <div className="login_page login_solid_bg">
                <div className="">
                    <div className="log_in_logo text-center">
                        <img style={{ height: '400px' }} src={Tile} alt="Logo" />
                    </div>
                    <div className="log_in_box">
                        <form className="input_form" onSubmit={handleSubmit}>
                            <div className="login_title">
                                <h2>PLEASE ENTER A STOCK SYMBOL</h2>
                                {notFound && (
                                    <div className="alert alert-danger" style={{ color: 'red' }} role="alert">
                                        Stock Symbol (Ticker) Not Found. Please Enter a Valid Stock Symbol
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nm"
                                    placeholder="Company Stock Symbol"
                                    value={stockSymbol}
                                    onChange={(e) => setStockSymbol(e.target.value)}
                                    style={{ height: '60px' }}
                                />
                            </div>
                            <div className="form-group">
                                <button className="btn btn-login">PREDICT THE FUTURE</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form;
