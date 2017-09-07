import * as React from 'react';

class Unregister extends React.Component { render() {
    return (
        <div className="login-wrap">
            <h2>Unregister Form</h2>
            <div className="form">
                <input type="text" placeholder="email" id="unregemail" name="email"/>
                <button id="unregButton">Unregister</button>
            </div>
        </div>
    );
  }
}

export default Unregister;
