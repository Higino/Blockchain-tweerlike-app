import { Component } from 'react';
import Identicon from 'identicon.js'

class AccountAvatar extends Component {

    render () {
    return (
        <>
            {this.props.accountAddress}{this.props.accountAddress
                    ?  
                    <img
                        className="ml-2"
                        width="40"
                        height="30"
                        src={`data:image/png;base64,${new Identicon(this.props.accountAddress, 30).toString()}`}
                        alt="small icon"
                    />
                    : <span></span>}
        </>
    )}
}

export default AccountAvatar