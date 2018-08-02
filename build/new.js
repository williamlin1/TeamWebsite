function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var Comment = React.createClass({displayName: "Comment",
  render: function() {  
      var commentLineDisplay;
      console.log("body " + this.props.body + " " + this.props.header);
      if (this.props.type == 'top') {
     
        var jArray = JSON.parse(this.props.body);
        var comment = jArray[0];
        var url = jArray[1];
        var title = jArray[2];
        commentLineDisplay = (
          React.createElement("div", {className: "top"}, 
              React.createElement("a", {href: url}, title), 
              comment, 
              React.createElement("h4", null, " ", this.props.author, " ")
          )
          );
        }
        else {
          commentLineDisplay = 
          (React.createElement("div", {className: "comment"}, 
              this.props.header, " ", "\u00a0 \u00a0", 
              this.props.body, 
              React.createElement("h4", null, " ", this.props.author, " ")
          ));
        };
      
    return (
      React.createElement("div", null, 
       commentLineDisplay 
      )
      );
  } 
});

var iterator = function(darray, f, acc) {
  for (var i = 0; i < darray.length; i++) {
//    console.log("message return " + JSON.stringify(f(darray[i].value)));
    acc.push(f({
      value: darray[i].value,
      level: darray[i].level}));
    if (darray[i].hasOwnProperty("next")) acc = iterator(darray[i].next, f, acc);
  }
  return acc;
}

var CommentList = React.createClass({displayName: "CommentList",
  getInitialState: function() {
        return { showComments: [] };
  },
  onClick: function(i) {      
      var newStates = this.state.showComments;
      if (this.state.showComments[i]) newStates[i] = false;
      else newStates[i] = true;
      this.setState({ showComments: newStates});
  },
  render: function() {
    var onReplySubmit = this.props.onCommentSubmit;

    if (this.props.data.modelArray.length != 0)  { 

        var showCommentsLocal = this.state.showComments;
        var onClickLocal = this.onClick;
        var commentNodes = this.props.data.modelArray.map(
          function(ditem, i) {
            var message = ditem.value;
            var commentButton;
            if ((showCommentsLocal[i] == false || showCommentsLocal[i] == null) && ditem.hasOwnProperty("next")) {
              commentButton =  React.createElement("button", {type: "button", onClick: onClickLocal.bind(null,i)}, "more") 
            } else if (showCommentsLocal[i] == true && ditem.hasOwnProperty("next")) {
              commentButton =  React.createElement("button", {type: "button", onClick: onClickLocal.bind(null,i)}, "less") 
            } 
            var commentDisplay;
            if (showCommentsLocal[i] == true && ditem.hasOwnProperty("next")) {
              commentDisplay = iterator(ditem.next, 
                  function(ditem) {
                      var message = ditem.value;
                      var alignPixels = 100 * ditem.level;
                      var dStyle = {"align": "left", "marginLeft": alignPixels.toString() + "px"};       
                      console.log("dStyle " + JSON.stringify(dStyle));
                      return (
                        React.createElement("div", {style: dStyle}, 
                        React.createElement(Comment, {author: message._createdAt, header: message.header, type: message.type, body: message.body}), 
                        React.createElement(ReplyForm, {id: message.id, onReplySubmit: onReplySubmit})
                      ) 
                      );
                  }, 
                  [] ); 
            };
            return (
              React.createElement("div", null, 
                React.createElement(Comment, {author: message._createdAt, header: message.header, type: message.type, body: message.body}), 
                React.createElement(ReplyForm, {id: message.id, onReplySubmit: onReplySubmit}), 
                commentButton, 
                React.createElement("div", null, 
                commentDisplay
                )
              )               
            );
          }, 
          [] ); 
      }  
      return (     
      React.createElement("div", {className: "commentList"}, 
        React.createElement("h1", null, " Articles "), 
        commentNodes
      )
      );
    }
});

var addIdFields = function(messageFields) {

  messageFields["_createdAt"] = new Date();
  messageFields["_createdBy"] = "test";
  messageFields["Id"] = "NW" + guid();
  messageFields["owner"] = "SIafb754b3-a010-414c-8083-f3f78d0c7ad71d14f03c-8bff-4fea-b850-4790ed06495b";
  messageFields["type"] = "comment";
  return messageFields;
}

var sendCommentMessage = function(kindName, message, formurl) {

    console.log("sendCommentMessage " + JSON.stringify(message));

    var newMessage = {
      kind: kindName,
      type: "cast",
      key: message.Id,
      extra: "[\"Subscriber\",\"SubAccount\",\"T2\"]",
      message: message
    };

    var sendMessage = {
      op: "puts",
      m: JSON.stringify([newMessage])
    };

    console.log(JSON.stringify(sendMessage));
    $.ajax({
      url: formurl,
      dataType: 'json',
      type: 'POST',
      data: sendMessage,
      success: function(data) {
        console.log(data);
//        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(formurl, status, err.toString());
      }.bind(this)
    });
}

var model = function(messages) {
  this.modelArray = [];
  this.modelIndex = {};
  console.log(JSON.stringify(messages) + " this " + JSON.stringify(this));
  var thisModel = this;
  messages.map(function(x) {
    var messageJSON = JSON.parse(x.message);   
    messageJSON.id = x.id; 
    updateModel.call(thisModel, messageJSON);
  });
};

var updateModel = function(newData) {
  var messageObj = {};
  messageObj.value = newData; 
  this.modelIndex[newData.id] = messageObj;
  
  if (newData.key == "" || newData.key == null) {
    this.modelArray.push(messageObj);
    messageObj.level = 0;
  } else {
    console.log("key " + newData.key);
    messageObj.level = this.modelIndex[newData.key].level + 1;
    if (this.modelIndex[newData.key].next == null) {
        this.modelIndex[newData.key].next = [messageObj];
    } else 
    {
      this.modelIndex[newData.key].next.push(messageObj);
    }
  }
  return this;
}

var CommentBox = React.createClass({displayName: "CommentBox",
  getInitialState: function() {
    return {data: new model([])};
  },

  componentDidMount: function() {
    $.ajax({
      url: this.props.queryurl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("data " + data);
        var dataModel = new model(data.messages);
        this.setState({data: dataModel});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.queryurl, status, err.toString());
      }.bind(this)
    });
  },

  handleCommentSubmit: function(comment) {
    var newComment = addIdFields(comment);
    var newModel = updateModel.call(this.state.data, newComment);
   
    this.setState({data: newModel});
    sendCommentMessage("V0Comments", newComment, this.props.formurl);    
  },

  handleArticleSubmit: function(comment) {
    var newComment = addIdFields(comment);
    sendCommentMessage("V0follow", newComment, this.props.formurl);    
  },


  render: function() {
    return (
      React.createElement("div", {className: "commentBox"}, 
        React.createElement(CommentList, {data: this.state.data, onCommentSubmit: this.handleCommentSubmit}), 
        React.createElement(CommentForm, {onCommentSubmit: this.handleArticleSubmit})
      )

    );
  }
});

var CommentForm = React.createClass({displayName: "CommentForm",
  handleSubmit: function(e) {
      e.preventDefault();
      var symbol = React.findDOMNode(this.refs.symbol).value.trim();
      var text = React.findDOMNode(this.refs.text).value.trim();
      if (!text || !symbol) {
        return;
      }

      var textArray = ["", text, ""];

      this.props.onCommentSubmit({
        key: "",
        body: JSON.stringify(textArray),
        header: symbol }
      );
      React.findDOMNode(this.refs.symbol).value = '';
      React.findDOMNode(this.refs.text).value = '';
      return;
    },

  render: function() {
    var t = {size:10};
    return (
      React.createElement("form", {className: "commentForm", onSubmit: this.handleSubmit}, 
        React.createElement("input", {type: "text", size: "10", placeholder: "Stock symbol", ref: "symbol"}), 
        React.createElement("input", {type: "text", placeholder: "Enter link here...", ref: "text"}), 
        React.createElement("input", {type: "submit", value: "Post"})
      )
    );
  }
});

var ReplyForm = React.createClass({displayName: "ReplyForm",
  getInitialState: function() {
        return { showResults: false };
  },
  onClick: function() {
      this.setState({ showResults: true });
  },
  handleSubmit: function(e) {

      e.preventDefault();
      var text = React.findDOMNode(this.refs.reply).value.trim();

      if (!text) {
        return;
      }

      var newMessage = {
        key: this.props.id,
        body: text,
        header: "user"
      }
  
      console.log("new message" + JSON.stringify(newMessage));
      this.props.onReplySubmit(newMessage);
      React.findDOMNode(this.refs.reply).value = '';
      this.setState({ showResults: false});
      return;
  },

  render: function() { 
    if (this.state.showResults == true) 
    { 
      return (
          React.createElement("form", {className: "replyForm", onSubmit: this.handleSubmit}, 
            React.createElement("input", {type: "text", placeholder: "Say something...", ref: "reply"}), 
            React.createElement("input", {type: "submit", value: "Post"})
          )
      );
     } else {
      return (
        React.createElement("button", {type: "button", onClick: this.onClick}, "reply")
      );
     }
  }
});

React.render(
//    <CommentBox queryurl = "http://fine-century-242.appspot.com/subscription/q?op=get&kind=V0Comments" formurl = "http://localhost:8888/subscription"/>,
    React.createElement(CommentBox, {queryurl: "http://localhost:8888/subscription/q?op=get&kind=V0Comments", formurl: "http://localhost:8888/subscription"}),
    document.getElementById('content'));