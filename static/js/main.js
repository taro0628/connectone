function init() {
    stage = new createjs.Stage('Canvas');

    $('Canvas').attr({width : windowWidth});
    $('Canvas').attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);

    var data = {};
    data.images = ['static/img/loading.png'];
    data.frames = {width:100, height:100, regX:50, regY:50};
    data.animations = {load: [0, 16]};
    var loadingIconSheet = new createjs.SpriteSheet(data);
    loadingIcon = new createjs.Sprite(loadingIconSheet);

    createjs.EventDispatcher.initialize(Sequencer.prototype);
    createjs.Ticker.addEventListener('tick', tick);
}


$(window).on('mouseup', function(event){
    //画面に何もなければ新しくシーケンサーを作成
    if(sequencerList.length == 0){
        placeSequncer(event.pageX, event.pageY);
        return;
    }

});
function placeSequncer(x, y, tone) {

    loadingIcon.x = x;
    loadingIcon.y = y;
    loadingIcon.scaleX = 0;
    loadingIcon.scaleY = 0;
    loadingIcon.gotoAndPlay("load");
    stage.addChild(loadingIcon);
    createjs.Tween.get(loadingIcon)
        .to({scaleX: 0.7, scaleY: 0.7}, 100);

    //スクリーンネームで指定したユーザが呟いた固有名詞を取得
    var getTweet = function(screenName){
        return $.ajax({
            type: 'GET',
            url: 'http://localhost:8001/tweet/words/' + encodeURI(screenName),
            dataType: 'json'
        });
    };

    //textでtweetを検索しヒットしたユーザのスクリーンネームを取得
    var getScreenName = function(text){
        return $.ajax({
            type: 'GET',
            url: 'http://localhost:8001/user/name/' + encodeURI(text),
            dataType: 'text'
        });
    };

    //スクリーンネームからアイコン画像を取得
    var getIcon = function (screenName) {
        var dfd = $.Deferred();
        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'http://localhost:8001/user/icon/' + encodeURI(screenName), true);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load',function(ev){
            var bytes = new Uint8Array(this.response);
            var binaryData = '';
            //1バイトずつ文字コードから文字に変換しバイナリデータを作成
            for (var i = 0, len = bytes.byteLength; i < len; i++) {
                binaryData += String.fromCharCode(bytes[i]);
            }
            var bytes = new Uint8Array(this.response);
            //ファイルの種類によってヘッダーを振り分ける
            if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.byteLength-2] === 0xff && bytes[bytes.byteLength-1] === 0xd9) {
                imgSrc = 'data:image/jpeg;base64,';
            }
            else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
                imgSrc = 'data:image/png;base64,';
            }
            else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
                imgSrc = 'data:image/gif;base64,';
            }
            else if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
                imgSrc = 'data:image/bmp;base64,';
            }
            else {
                imgSrc = 'data:image/unknown;base64,';
            }
            var image = new Image();
            //Base64にエンコード
            var iconSrc = imgSrc + window.btoa(binaryData);

            dfd.resolve(iconSrc);
        });
        xhr.send();
        return dfd.promise();
    };

    //トーンが指定されていなければダミーのテキストを設定
    var text;
    if(tone != undefined){
        text = tone.text;
    }else{
        text = 'none'
    }

    var screenName;
    var iconSrc;

    getScreenName(text)
    .then(function(response) {
        //トーンが指定されていなければデフォルトのスクリーンネームを設定
        if(tone == undefined){
            screenName = 'taro0628';
        }else{
            screenName = response;
        }
        return getIcon(screenName);
    })
    .then(function(response) {
        iconSrc = response;
        return getTweet(screenName);
    })
    .done(function(words){
        console.log(words)
        //アイコン画像、頻出単語が揃ったのでシーケンサーを作成
        createjs.Tween.get(loadingIcon)
            .to({scaleX: 0, scaleY: 0}, 100)
            .call(function(x, y, tone, words, iconSrc){
                createSequncer(x, y, tone, words, iconSrc);
            },[x, y, tone, words, iconSrc]);
    })
    .fail(function() {
        console.log('Error');
    });
}
function createSequncer(x, y, tone, words, iconSrc){
//シーケンサーを設置する関数
//トーンが指定されていれば設置したシーケンサーと繋ぐ

    tone = tone || undefined;
    var rand = Math.random();
    var component = rand>0.5 ? Rect : Circle;
    var seq = new Sequencer(x, y, '#96bbb3', component, words, iconSrc);
    sequencerList.push(seq);
    //seq.on('mousedown', seq.mousedown);
    //seq.on('pressmove', seq.mousemove);
    //seq.on('pressup', seq.mouseup);
    seq.display();

    //トーンが指定されていれば線を引く
    if(tone != undefined){
        tone.connectedSeq.push(seq);
        lineList.push(new Line(seq, tone, '#fff'));
    }
}

function placeTone(sequencer, text, x, y, r){
    //トーンを設置する関数
      var _x;
      var _y;
      var random = 2*Math.PI * Math.random();
      sequencer.r = r;
      _x = r * Math.cos(random) + x;
      _y = r * Math.sin(random) + y;
      var tone = new Tone(_x, _y, '#96bbb3', text);
      sequencer.toneList.push(tone);
      tone.display();
      tone.connectedSeq.push(sequencer);
      lineList.push(new Line(sequencer, tone, '#fff'));

}

function tick() {
    var currentTime = ctx.currentTime;

    for(var i=0; i<sequencerList.length; i++){
        var seq = sequencerList[i];
        var seqScore = seq.score;
        var seqQueue = seq.notesInQueue;

        //シーケンサーのキューの時間が過ぎていればエフェクトを再生
        if (seqQueue.length && seqQueue[0].time < currentTime) {
            seq.noteOn();
            seqQueue.splice(0,1);
        }
        for (var j=0; j<seq.toneList.length; j++){
            var toneScore = seq.toneList[j].score;
            var toneQueue = seq.toneList[j].notesInQueue;
            //トーンのキューの時間が過ぎていればエフェクトを再生
            if (toneQueue.length && toneQueue[0].time < currentTime) {
                seq.toneList[j].noteOn();
                toneQueue.splice(0,1);
            }
        }
    }

    //線の表示を更新
    for(var i=0; i<lineList.length; i++){
        lineList[i].update();
    }
    stage.update();
}
