// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SocialNetwork {
    string public name;
    uint public postCount = 0;
    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    constructor() public {
        name = "Social Network Contract";
    }

    event PostCreated(
        string name,
        uint id,
        string content,
        address payable author
    );

    function createPost(string memory _content) public {
        require(bytes(_content).length > 0 );
        postCount++;
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        emit PostCreated('PostCreated', postCount, _content, msg.sender);
    }

    event PostTiped(
        string name,
        uint postId,
        uint tipAmount,
        address tiper,
        string tipType
    );

    // Weak tips do not exchange ether
    function weakTip (uint _id, uint _amount) public {
        //FETCH POST
        Post memory _post = posts[_id];
        require(_amount > 0);
        require(_id <= postCount);

        //Increase tip amount of the post
        _post.tipAmount += _amount;
        
        // UPDATE POST
        posts[_id] = _post;

        // Emit event
        emit PostTiped('PostTiped', _id, _amount, msg.sender, 'WEAK');
    }

    // Strong tips exchange ether between author of the post and the tiper
    function strongTip (uint _id) public payable {
        require(_id > 0 && _id <= postCount);

        //FETCH POST
        Post memory _post = posts[_id];

        address payable _author = _post.author;

        // EXCHANGE ETHER BETWEE AUTHOR and TIPER
        address(_author).transfer(msg.value);

        //Increase tip amount of the post
        _post.tipAmount += msg.value;


        
        // UPDATE POST
        posts[_id] = _post;

        // Emit event
        emit PostTiped('PostTiped', _id, msg.value, msg.sender, 'STRONG');        
    }
}