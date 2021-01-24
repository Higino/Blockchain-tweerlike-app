import { Component } from "react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import AccountAvatar from "./AccountAvatar"

class TweeItem extends Component {

  handleTipPost (event) {
    this.props.handleTipCallBack(this.props.itemId)
  }

  render () {
  return (
      <div className="mb-2">
      <Card className="text-left">
        <Card.Header><AccountAvatar accountAddress={this.props.account}/></Card.Header>
        <Card.Body>
        <Card.Text className="display-linebreak">
          {this.props.itemText}
        </Card.Text>
        <Card.Footer className="d-flex justify-content-between">
          <small className="float-left mt-1 text-muted">TIPS: {window.web3.utils.fromWei(this.props.itemTipAmout, 'ether')} Eth</small>
          <Button className="btn btn-link btn-sm float-right pt-0" 
                  variant="link"
                  onClick={this.handleTipPost.bind(this)}>
            <small>TIP 0.01 ETH</small></Button>
        </Card.Footer>
      </Card.Body>
      </Card>   
      </div>
  )}
}

export default TweeItem