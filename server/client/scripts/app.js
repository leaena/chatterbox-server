var rooms = {};
var currentRoom;
var currentRoomUrl;
var friends = [];
var Chat = Backbone.Model.extend({
  url: 'http://127.0.0.1:8080/classes/messages',//?order=-createdAt&limit=20' + (currentRoomUrl || "");
  receive: function(options){
    $.ajax({
      // always use this url
      url: 'http://127.0.0.1:8080/classes/messages?order=-createdAt&limit=20' + (currentRoomUrl || ""),
      type: 'GET',
      contentType: 'application/json',
      success: options.success
    })
  }
});

/*
* HELPER FUNCTIONS
*/
var getRoom = function(room){
  currentRoom = room;
  currentRoomUrl ='&where={"roomname":"' + room + '"}';
}

var grabUsername = function(){
  var re = new RegExp(/(&|\?)username=/);
  var string = window.location.search;
  return string.replace(re, "");
}

var sanitize = function(string){
  var re = new RegExp(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/);
  var string = string || "";
  if(string.length > 160){
    string = string.slice(0,159);
  }
  return string.match(re);
}
var sanitizeRoom = function(string){
  var re = new RegExp(/(<([^>]+)>)/ig);
  var string = string || "";
  if(string.length > 160){
    string = string.slice(0,159);
  }
  return string.replace(re, "");
}


/*
* CRUD FUNCTIONS
*/
var Chats = Backbone.Collection.extend({
  model: Chat,
  get: function(){
    var chat = new Chat();
    var that = this;
    chat.receive({
      success: function(data){
        that.trigger('get', JSON.parse(data));
      }
    });
  }
});

var renderMessage = function(message){
  var userText;
  var messageText;
  if(friends.indexOf(message.username) !== -1){
    userText = "<strong>" + sanitize(message.username) + "</strong>";
    messageText = "<strong>" + sanitize(message.text) + "</strong>";
  }
  return "<div class='message'>" + "<span class='username'>" + (userText || sanitize(message.username)) + "</span>" + ": " + "<span class='text'>" + (messageText || sanitize(message.text)) + "</span>" + "</div>";
};


/*
* VIEWS
*/
var NewChatsView = Backbone.View.extend({
  events: {
    'click .submit': 'addMessage'
  },
  initialize: function(){
    // user message submit
  },
  addMessage: function(){
    var message = $('.userMessage').val();
    var username = grabUsername();
    var messageObject = {
      'username': username,
      'text': message,
      'roomname': (currentRoom || '')
    };
    this.collection.create(messageObject);
    $('.userMessage').val("");
  }
})

var ChatsView = Backbone.View.extend({
  initialize: function(){
    var that = this;

    this.collection.on('get', this.appendMessages, this);

    setInterval(function(){that.collection.get();}, 1000);
  },
  appendMessages: function(data){
    var that = this;
    this.$('.chat').empty();
    $.each(data, function(i, item){
      that.$('.chat').append(renderMessage(item));
      // get rooms
      if(item.roomname && sanitizeRoom(item.roomname) === item.roomname){
        rooms[item.roomname] = true;
      }
    });
  }
});

/*
* EVENT LISTENERS
*/
$(document).ready(function() {
  // new message retrieval
  var chats = new Chats();
  new NewChatsView({collection: chats, el: $('.submit').parent()});
  new ChatsView({collection: chats, el: $('.chatClient')});

  // render rooms
  setInterval(function(){
    $('ul').empty();
    $.each(Object.keys(rooms), function(i, room){
      var link = '<li><a class="roomname">' + room + "</a></li>";
      $(".rooms").append(link);
    });
  }, 1000);

  // room entry
  $('ul').on('click', 'a', function(){
    $('.roomTitle').text(" - " + $(this).text());
    getRoom($(this).text());
  })

  // create room
  $('.newRoom').on('click', function(){
    var room = prompt("What do you want to call this room?");
    rooms[room] = true;
  })

  //reset rooms
  $('h1').on('click', function(){
    $('.roomTitle').text('');
    currentRoomUrl = undefined;
  });

  $('.chat').on('click', '.username', function(){
    friends.push($(this).text());
  });
  
});