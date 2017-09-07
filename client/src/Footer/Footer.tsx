import * as React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

class Footer extends React.Component { render() {
    return (
        <footer>
            <p>
                <small>
                    PoeSales - Want to stop receiving emails? Unregister <Link to="/unregister">here</Link>
                    <br/>
                </small>
                <small>
                    Found any bugs on the website? Report <a href="https://github.com/LucasIME/PoESales/issues">here</a>
                </small>
            </p>
        </footer>
        )
  }
}

export default Footer;

