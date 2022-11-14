import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function Navigation(props) {
    return (
        <Navbar expand="lg" >
            <Container>
                <Navbar.Brand href="#home">Web Chat | Socket.io and React</Navbar.Brand>
                <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                <Navbar.Collapse id='responsive-navbar-nav' className="justify-content-end">
                    <Navbar.Text>
                        Socket ID: {props?.socketID}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;