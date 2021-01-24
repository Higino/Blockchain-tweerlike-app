import { Component } from 'react';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import TweetItem from './TweetItem'

class MainPanel extends Component{
  state = {
    socialnetworkcontract: {},
    tweetText: '',
    tweetFeed: []
  }

  constructor(props) {
    super(props)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleTweet = this.handleTweet.bind(this)
  }

  async loadFeedsFromBlockchain () {
    let socialNet = this.props.socialNetworkBlockChainContract
    if( !socialNet ) {
      console.log('Cannot load block chain tween feeed. Invalid contract')
      return
    }
    this.setState({tweetFeed: []})
    // Load posts
    const postCount = await socialNet.methods.postCount().call()

    for( let i=1; (i <= postCount && socialNet) ; i++ ) {
      let post = await socialNet.methods.posts(i).call()
      this.setState({tweetFeed: [...this.state.tweetFeed, post]})
    }
  }

  async componentDidMount(){
    this.setState({
      socialnetworkcontract: this.props.socialNetworkBlockChainContract
    })

    await this.loadFeedsFromBlockchain()

  }
  
  handleTextChange(e) {
    this.setState({
      tweetText: e.target.value
    })
  }

  handleTweet(e) {
    //const tweet = {author: acct, content: this.state.tweetText, tipAmount: 0}
    this.state.socialnetworkcontract.methods
                    .createPost(this.state.tweetText).send({from: this.props.account})
                    .once('receipt', (r) => {
                      this.loadFeedsFromBlockchain()
                      this.setState({tweetText: ''})
                    })
  }

  async handleTip(postId) {
    this.state.socialnetworkcontract.methods
      .strongTip(postId)
      .send({from: this.props.account,
            value: window.web3.utils.toWei('0.1', 'ether')})
      .once('receipt', (r) => {
        this.resfreshPostData(postId)
    })
  }

  async resfreshPostData(postId) {
    await this.state.socialnetworkcontract.methods.posts(postId).call().then( (post) => {
      let newFeed = this.state.tweetFeed.map((e) => {
        if( e.id === postId ) {
          e = post
        }
        return e
      })
      this.setState({tweetFeed: newFeed})
      })
  }

 
  render () {

  return (
      <>
      <div className="mb-3 mt-5">
        <div className="display-linebreak">
        <Form>
          <Form.Group controlId="formBasicTweet">
            <Form.Label>Blockchain tweeter</Form.Label>
            <Form.Control onChange={this.handleTextChange} as="textarea" name="textarea"
                          value={this.state.tweetText}
                          type="text" placeholder="What's on your mind?" />
            <Form.Text className="text-muted">
              The smarter the content the more likely it is to be tiped by someone. Earn ETH by posting ;)
            </Form.Text>
          </Form.Group>
          <Button disabled={this.state.tweetText === ''} type="button" className="btn btn-primary btn-lg btn-block"
                  onClick={this.handleTweet}>Tweet</Button>                 
      </Form>
        </div>
        <hr></hr>
      </div>
      <div>
        <div >
          {this.state.tweetFeed.map((item, index) => (
            <TweetItem  account={item.author} 
                        key={index} 
                        itemId={item.id}
                        itemText={item.content} 
                        itemTipAmout={item.tipAmount}
                        handleTipCallBack={this.handleTip.bind(this)} />
          ))}
      </div>   
      </div>
      </>)
    }
}

export default MainPanel