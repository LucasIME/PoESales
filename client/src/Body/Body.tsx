import * as React from 'react';
import Register from '../Register/Register';
import Quickmail from '../Quickmail/Quickmail';

class Body extends React.Component { 
    render() {
        return (
            <div>
                <Register/>
                <Quickmail/>
            </div>
        );
    }
}

export default Body;
