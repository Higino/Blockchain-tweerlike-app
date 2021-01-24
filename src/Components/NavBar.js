import {Navbar, Nav} from 'react-bootstrap'
import AccountAvatar from './AccountAvatar'

function NavBar(props) {
    return (
        <div>
            <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">Chainlink Social Network</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                
                </Nav>
                {props.blockChainAccount
                    ?  
                    <AccountAvatar accountAddress = {props.blockChainAccount}/>
                    : <span></span>} @ {props.netId}
            </Navbar.Collapse>
            </Navbar>            
        </div>
    )  
}

export default NavBar