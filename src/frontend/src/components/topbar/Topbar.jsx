import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './topbar.css';
import { logoutCall } from '../../context/authContext/apiCalls';
import { AuthContext } from '../../context/authContext/AuthContext';
import logoImage from '../../logo.png';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
export default function Topbar() {
  const { dispatch } = useContext(AuthContext);
  const history = useHistory();
  const handleLogout = (e) => {
    e.preventDefault();
    logoutCall(dispatch);
    history.push('/');
  };

  return (
    <div className='topbar'>
      <div className='topbarWrapper'>
        <div className='topLeft'>
          <span className='logo'>
            <Link className='link' to={{ pathname: '/' }}>
              <img
                src={logoImage}
                alt='Logo Preview'
                className='logo'
              />
            </Link>
          </span>
        </div>
        <div className='topRight'>
          <NotificationsActiveIcon style={{height:'1.5em',width: '1.5em', marginRight: '20px', color:'red'}} />
          <div className='topbarIconContainer' onClick={handleLogout}>
            Logout
          </div>
          <img
            src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlOLBRK-3wEFFeCojWlHou4nooggl5iI2PJQ&s'
            alt=''
            className='topAvatar'
          />
        </div>
      </div>
    </div>
  );
}
