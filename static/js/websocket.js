$(document).ready(function() {
    if (!window.WebSocket) {
        if (window.MozWebSocket) {
            window.WebSocket = window.MozWebSocket;
        } else {
            console.log("Your browser doesn't support WebSockets.");
        }
    }
    ws = new WebSocket('ws://localhost:8001/websocket');
    ws.onopen = function(evt) {
        console.log('WebSocket connection opened.');
    }
    ws.onmessage = function(evt) {
        console.log(evt.data);
        //改行を除去
        var str = evt.data.replace(/[\n\r]/g,"");
        var r = parseInt(str.length);
        var offsetX = windowWidth/2;
        var offsetY = windowHeight/2;
        console.log(str);
        //1文字ずつ処理
        for (i = 0; i < str.length; i++) {
            var _str = new createjs.Text(str.charAt(i), "20px Arial", "#ff7700");
            var strCount = str.length;

            _str.x = r*3 * Math.cos(i * 2 * Math.PI) + offsetX;
            _str.y = r*3 * Math.sin(i * 2 * Math.PI) + offsetY;
            createjs.Tween.get(_str)
                //.to({x:windowWidth}, 2000)
                .wait(2000)
                .call(function(_str){
                    stage.removeChild(_str);
                }, [_str]);
            stage.addChild(_str);
        }

        stage.update();
    }
    ws.onclose = function(evt) {
        console.log('WebSocket connection closed.');
    }
    $('#send').submit(function() {
        ws.send($('input:first').val());
        $('input:first').val('').focus();
        return false;
    });
});
