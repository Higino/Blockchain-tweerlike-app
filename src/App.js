import React, { Component } from 'react';
import { Spinner } from 'react-bootstrap';
import './App.css';
import TweetFeedPanel from './Components/MainPanel';
import AppNavBar from './Components/NavBar';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3'
import SocialNetwork from './abis/SocialNetwork.json'

class App extends Component {
  state = {
    loading: true,
    blockChainAccount: '',
    netId: '',
    socialNetContract: undefined,
    netType: '',
    postCount: 0,
    socialNetworkBlockChainContract: {},
    tweetFeed: []
}

  constructor(props) {
    super(props)

    this.loadBlockChainData = this.loadBlockChainData.bind(this)
  }

  async loadBlockChainData() {
    let account = (await window.web3.eth.getAccounts())[0]
    let netId = await window.web3.eth.net.getId()
    let netType = await window.web3.eth.net.getNetworkType()

    // L:oad contracts relevant for this app
    const socialNet = SocialNetwork.networks[netId] ?
                      new window.web3.eth.Contract(SocialNetwork.abi, SocialNetwork.networks[netId].address ) :
                      undefined

    this.setState({
      blockChainAccount: account,
      netId: netId,
      socialNetContract: socialNet,
      netType: netType,
      socialNetworkBlockChainContract: socialNet,
    })
  }

  async componentDidMount() {
    const provider = await detectEthereumProvider();

    if (provider) {
      // From now on, this should always be true:
      // provider === window.ethereum
      //startApp(provider); // initialize your app
      window.web3 = new Web3(provider)
      await window.ethereum.enable()
      console.log('ethereum is connected? ' + provider.isConnected())
    } else {
      window.alert('Non-Etherium browser detected. You should consider trying metamask')
      console.log('Please install MetaMask!');
    }

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    window.ethereum.on('accountsChanged', async (accs) => {await this.loadBlockChainData()}); 
    
    //MetaMask: MetaMask will soon stop reloading pages on network change.
    // For more information, see: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-autorefreshonnetworkchange 
    // Set 'ethereum.autoRefreshOnNetworkChange' to 'false' to silence this warning.
    // Now, set the callback for when user changes metamask settings
    window.ethereum.autoRefreshOnNetworkChange = false

    await this.loadBlockChainData()

    this.setState({loading:false})
  }


  render () {
    let content = 
    <div className="m-5">
      <Spinner animation="border" variant="primary">
        <span className="sr-only">Loading...</span>
      </Spinner>
      <div>Loading BlockChain Data ...</div>
    </div>
    
    if( !this.state.loading ) {
      if( !window.ethereum ) {
        content = 
        <div className="m-5">
        <h1>Cannot initialize app</h1>
        <p>Please install metamask or access this through an etherium enabled browser</p>
        </div>

      } else {
        content = 
        <div className="App">
        <AppNavBar  blockChainAccount={this.state.blockChainAccount}
                    netId={this.state.netId}
                    netType={this.state.netType}/>
        <div className='mx-5'><TweetFeedPanel account={this.state.blockChainAccount}
                                              tweetFeed = {this.state.tweetFeed}
                                              socialNetworkBlockChainContract = {this.state.socialNetworkBlockChainContract}/></div>
      </div>
      }
      
    }

    return (
      <>{content}</>
    )
  }
}

export default App;
