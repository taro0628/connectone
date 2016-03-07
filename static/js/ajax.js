function getTweet() {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8001/tweet/words',
    dataType: 'html',
    success: function(response) {
        console.log(response);
    },
    error: function() {
        console.log('Error');
    },
    complete: function() {
        console.log('Complete');
    }
  });
}
