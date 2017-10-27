import * as React from 'react';

interface IRegisterState {
    email: string;
}

class Register extends React.Component<{}, IRegisterState>{

    constructor() {
        super();
        this.state = { email: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ email: event.currentTarget.value });
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        fetch('/emails/addemail', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.state.email,
            })
        }).then(response => response.json())
        .then(this.treatResponse);
    }

    treatResponse(response: any) {
        alert(response.msg);
    }

    render(): JSX.Element {
        return(
        <div>
            <div className="container">
                <p className="lead">
                    Tired of missing sales? Register your email with us and we'll reming your off every sale!
                </p>
            </div>
            <form onSubmit={this.handleSubmit}>
                <div className="login-wrap">
                    <h2>Registration Form</h2>
                    <div className="form">
                        <input type="text" placeholder="email" id="regemail" name="email" value={this.state.email} onChange={this.handleChange}/>
                        <button id="regButton">Register</button>
                    </div>
                </div>
            </form>
        </div>
    );
    }
}

export default Register;
