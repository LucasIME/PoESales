import * as React from 'react';
import './Footer.css';

class Footer extends React.Component { render() {
    return (
        <footer>
            <p>
                <small>
                    PoeSales - Want to stop receiving emails? Unregister <a href="/unregister">here</a>
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

