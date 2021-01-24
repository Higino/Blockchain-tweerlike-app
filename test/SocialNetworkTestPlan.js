const { assert } = require('chai');
const { default: Web3 } = require('web3');

const SocialNetwork = artifacts.require('./SocialNetwork.sol')
const DEPLOYER_ACCOUNT_INDEX = 0;
const AUTHOR_ACCOUNT_INDEX = 1;
const TIPER_ACCOUNT_INDEX = 2;


require('chai')
    .use(require('chai-as-promised'))
    .should()

    contract('SocialNetwork', (accounts) => {
        let socNet

        before(async () => {
            socNet = await SocialNetwork.deployed()
        })

        describe('Deplyment test suite', async () => {
            it('SmartContract exists', async () => {
                const address = socNet.address
                assert.notEqual(address,undefined)
                assert.notEqual(address,'')
                assert.notEqual(address,0x0)
                assert.notEqual(address,null)
            })

            it('SmartContract has a valid name', async () => {
                const name = await socNet.name()
                assert.equal(name, 'Social Network Contract')
            })
        })

        describe('Posting test suite', async () => {
            const POST_CONTENT = 'A test post content'
            let postResult, postId, post
            const POST_AUTHOR_ADDRESS = accounts[AUTHOR_ACCOUNT_INDEX]

            before( async  () => {
                postResult = await socNet.createPost(POST_CONTENT, {from: POST_AUTHOR_ADDRESS})
                postId = await socNet.postCount()
                post = await socNet.posts(postId);
            })

            it('Post count increased', async () => {
                assert.equal( postId, 1)
            })

            it( 'A valid PostCreated event is broadcast', async () => {
                const event = postResult.logs[0].args
                assert.equal(event.name, 'PostCreated')

                assert.equal(event.id.toNumber(), postId.toNumber(), 'Post number is correct')
                assert.equal(event.author, POST_AUTHOR_ADDRESS, 'Author must match')
                assert.equal(event.content, POST_CONTENT, 'Content must match')
            })

            it('Post message cannot be empty', async () => {
                await socNet.createPost('', {from: POST_AUTHOR_ADDRESS}).should.be.rejected
                await socNet.createPost(null, {from: POST_AUTHOR_ADDRESS}).should.be.rejected
                await socNet.createPost(undefined, {from: POST_AUTHOR_ADDRESS}).should.be.rejected
            })

            it('A valid Post was persisted in the blockChain', async () => {
                assert.exists( post.id, postId, 'New post must be persisted in the bloickchain posts')
                assert.equal(post.content, POST_CONTENT, 'Persisted post content must mach its creation')
                assert.equal(post.author, POST_AUTHOR_ADDRESS, 'Persisted post author must mach its creation')
                assert.equal(post.tipAmount.toNumber(), 0, 'Post tip amoutn is empty on its creation')
            })

            describe('Tiping posts', async () => {
                let tipResult, weakTipAmountBefore
                const TIPER_ADDRESS = accounts[TIPER_ACCOUNT_INDEX]

                before( async () => {
                    weakTipAmountBefore = (await socNet.posts(postId)).tipAmount
                    tipResult = await socNet.weakTip(postId, 5, {from: TIPER_ADDRESS })
                    weakTipAmountAfter = (await socNet.posts(postId)).tipAmount
                    
                })
                it('A valid PostTiped event is broadcast', async () => {
                    let tipEvent = tipResult.logs[0].args
    
                    assert.equal(tipEvent.name, 'PostTiped', 'Event name must match')
                    assert.equal(tipEvent.postId.toNumber(), postId.toNumber(), 'Post id must match')
                    assert.equal(tipEvent.tipAmount.toNumber(), weakTipAmountAfter.toNumber(), 'Tip amount must match')
                    assert.equal(tipEvent.tiper, TIPER_ADDRESS)
                    assert.equal(tipEvent.tipType, 'WEAK')
                })

                it('Post gets updated of the correct tip amount', async () => {
                    const post = await socNet.posts(postId)
                    assert.equal(post.tipAmount, weakTipAmountBefore.toNumber() + 5, "Amount should be increased to 5 as initial is zero")
                })

                it('Tiping twice still increases the tip amount of post', async () => {
                    let tip = await socNet.weakTip(postId, 5, {from: TIPER_ADDRESS })
                    let post = await socNet.posts(postId)
                    assert.equal(post.tipAmount, weakTipAmountBefore.toNumber() + 10, 'Tip amount is now 10 as we tiped 5 twice')
                })

                describe('Strong tiping', async () => {
                    let idFreshPost = 0, tipResultStrong, res, oldAuthorBalance
                    before(async () => {
                        res = await socNet.createPost('Some text', {from: POST_AUTHOR_ADDRESS})
                        idFreshPost = res.logs[0].args.id
                        oldAuthorBalance = await web3.eth.getBalance(POST_AUTHOR_ADDRESS)
                        oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
                        tipResultStrong = await socNet.strongTip(idFreshPost, {from: TIPER_ADDRESS, value: web3.utils.toWei('1', 'ether') })
                    })
                    it('A valid PostTiped event is broadcast', async () => {
                        let tipEvent = tipResultStrong.logs[0].args
        
                        assert.equal(tipEvent.name, 'PostTiped', 'Event name must match')
                        assert.equal(tipEvent.postId.toNumber(), idFreshPost.toNumber(), 'Post id must match')
                        assert.equal(tipEvent.tipAmount, web3.utils.toWei('1', 'ether'), 'Tip amount must match')
                        assert.equal(tipEvent.tiper, TIPER_ADDRESS)
                        assert.equal(tipEvent.tipType, 'STRONG')
                    })
    
                    it('Post gets updated of the correct tip amount', async () => {
                        const newPost = await socNet.posts(idFreshPost)
                        assert.equal(newPost.tipAmount.toString(), web3.utils.toWei('1', 'ether'), "Amount should be increased to 1Eth as initial is zero")
                    })
                    it('Tiping should increase author balance', async () => {
                        let newAuthorBalance
                        newAuthorBalance = await web3.eth.getBalance(POST_AUTHOR_ADDRESS)
                        newAuthorBalance = new web3.utils.BN(newAuthorBalance)
                        
                        let tipAmt
                        tipAmt = web3.utils.toWei('1', 'ether')
                        tipAmt = new web3.utils.BN(tipAmt)
                        
                        const expectedBalance = oldAuthorBalance.add(tipAmt)
                        
                        assert.equal(newAuthorBalance.toString(), expectedBalance.toString())
                    })
                })
            })

        })
        
    })