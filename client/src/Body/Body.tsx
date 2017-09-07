import * as React from 'react';

class Body extends React.Component { render() {
    return (
        <div>
            <div className="container">
                <p className="lead">
                    Tired of missing sales? Register your email with us and we'll reming your off every sale!
                </p>
            </div>
            <div className="login-wrap">
                <h2>Registration Form</h2>
                <div className="form">
                    <input type="text" placeholder="email" id="regemail" name="email"></input>
                    <button id="regButton">Register</button>
                </div>
            </div>
            <div className="container">
                <br/>
                <p className="lead"> Want to be emailed the discount items now?</p>
                <div className="login-wrap">
                    <div className="form">
                        <input type="text" placeholder="email" id="sendemail" name="email"></input>
                        <button id="sendButton">Email me!</button>
                    </div>
                </div>
            </div>
        </div>
    )
  }
}

export default Body;

