import * as React from 'react';
import './Header.css';

class Header extends React.Component { render() {
    return (
        <div className="container">
            <div className="page-header">
                <h1>
                    <a href="/">PoESales</a>
                </h1>
            </div>
        </div>
        )
  }
}

export default Header;

