function getTweet() {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8001/tweet/words',
    dataType: 'html',
    success: function(response) {
        rand = Math.floor(Math.random() * response.length);
        text = response[rand];
        console.log(response);
        return response;
    },
    error: function() {
        console.log('Error');
    },
    complete: function() {
        console.log('Complete');
    }
  });
}
