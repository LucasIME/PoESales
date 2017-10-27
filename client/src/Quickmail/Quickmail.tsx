import * as React from 'react';

interface IQuickmailState {
    email: string;
}

class Quickmail extends React.Component<{}, IQuickmailState>{

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

        let email = this.state.email;

        fetch('/emails/scrape/' + email, {
            method: 'GET',
        }).then(response => response.json())
        .then(this.treatResponse);
    }

    treatResponse(response: any) {
        alert(response.msg);
    }

    render(): JSX.Element{
        return(
            <div className="container">
                <br/>
                <p className="lead"> Want to be emailed the discount items now?</p>
                <div className="login-wrap">
                    <div className="form">
                        <form onSubmit={this.handleSubmit}>
                            <input type="text" placeholder="email" id="sendemail" name="email" value={this.state.email} onChange={this.handleChange}/>
                            <button id="sendButton">Email me!</button>
                        </form>
                    </div>
                </div>
            </div>
    );
    }
}

export default Quickmail;