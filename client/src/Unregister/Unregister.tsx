import * as React from 'react';

interface IUnregisterState {
    email: string;
}

class Unregister extends React.Component<{}, IUnregisterState> {

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
        let shouldDelete = confirm('Are you sure you wanto to delete this user?');

        if(shouldDelete) {
            let userEmail = this.state.email;
            alert(userEmail);
            fetch('/emails/rememail', {
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
    }

    treatResponse(response: any) {
        alert("this is the response i got:" + JSON.stringify(response));
        if (response.msg === '') {
            alert('Unregistration email sent!');
        } else {
            alert('Error: ' + response.msg);
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="login-wrap">
                    <h2>Unregister Form</h2>
                    <div className="form">
                        <input type="text" placeholder="email" id="unregemail" name="email" value={this.state.email} onChange={this.handleChange} />
                        <button id="unregButton" >Unregister</button>
                    </div>
                </div>
            </form>
        );
    }
}

export default Unregister;
