////////////////////////////
//シーケンサーの管理に関わる関数
////////////////////////////

var sequencerList = [];

var placeSequncer = function(x, y, tone) {

    //ローディングアイコンを表示
    var loadingIcon = new createjs.Sprite(loadingIconSheet);
    loadingIcon.x = x;
    loadingIcon.y = y;
    loadingIcon.scaleX = 0;
    loadingIcon.scaleY = 0;
    loadingIcon.gotoAndPlay("load");
    stage.addChild(loadingIcon);
    createjs.Tween.get(loadingIcon)
        .to({scaleX: 0.7, scaleY: 0.7}, 100);
    isLoading = true;

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
            screenName = 'default';
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
        //アイコン画像、固有名詞が揃ったのでシーケンサーを作成
        createjs.Tween.get(loadingIcon)
            .to({scaleX: 0, scaleY: 0}, 100)
            .call(function(x, y, tone, words, iconSrc){
                createSequncer(x, y, tone, words, iconSrc);
                isLoading = false;
                if(!isExistSeq){isExistSeq=true}
            },[x, y, tone, words, iconSrc]);
    })
    .fail(function() {
        console.log('Error');
    });
}

//スクリーンネームで指定したユーザが呟いた固有名詞を取得
var getTweet = function(screenName){
    return $.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:8001/tweet/words/' + encodeURI(screenName),
        dataType: 'json'
    });
};

//textでtweetを検索しヒットしたユーザのスクリーンネームを取得
var getScreenName = function(text){
    return $.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:8001/user/name/' + encodeURI(text),
        dataType: 'text'
    });
};

//スクリーンネームからアイコン画像を取得
var getIcon = function (screenName) {
    var dfd = $.Deferred();
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://127.0.0.1:8001/user/icon/' + encodeURI(screenName), true);
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

var createSequncer =  function(x, y, tone, words, iconSrc){
//シーケンサーを設置する関数
//トーンが指定されていれば設置したシーケンサーと繋ぐ

    tone = tone || undefined;
    var rand = Math.random();
    var component = rand>0.5 ? Rect : Circle;
    var seq = new Sequencer(x, y, '#96bbb3', component, words, iconSrc);
    sequencerList.push(seq);
    seq.display();

    //トーンが指定されていれば線を引く
    if(tone != undefined){
        //トーンを登録
        seq.connectedTone.push(tone)

        tone.connectedSeq.push(seq);
        lineList.push(new Line(seq, tone, '#fff'));
    }
}

var deleteSequencer = function(seq){
    for (var i = 0; i < seq.connectedTone.length; i++) {
        //つながっているトーンから自分を消す
        var count = $.inArray(seq, seq.connectedTone[i].connectedSeq);
        seq.connectedTone[i].connectedSeq.splice(count, 1);
        //つながっているトーンにシーケンサーがなくなればトーンも消す
        if(seq.connectedTone[i].connectedSeq.length == 0){
            deleteTone(seq.connectedTone[i]);
        }
    }
    //シーケンサーリストから自分を消す
    deleteLine(seq);
    var count = $.inArray(seq, sequencerList);
    sequencerList.splice(count, 1);
    if(sequencerList.length == 0){
        currentSeq = undefined;
        isExistSeq = false;
    }
    seq.remove();
}

////////////////////////////
//トーンの管理に関わる関数
////////////////////////////

var placeTone = function(sequencer, text, x, y, r){
    //トーンを設置する関数
      var _x;
      var _y;
      var random = 2.5*Math.PI * Math.random();
      sequencer.r = r;
      _x = r * Math.cos(random) + x;
      _y = r * Math.sin(random) + y;
      var tone = new Tone(_x, _y, '#96bbb3', text);
      sequencer.connectedTone.push(tone);
      tone.display();
      tone.connectedSeq.push(sequencer);
      lineList.push(new Line(sequencer, tone, '#fff'));

}
var deleteTone  = function(tone){
    for (var i = 0; i < tone.connectedSeq.length; i++) {
        //つながっているシーケンサーから自分を消す
        var count = $.inArray(tone, tone.connectedSeq[i].connectedTone);
        tone.connectedSeq[i].connectedTone.splice(count, 1);
        //つながっているシーケンサーにトーンがなくなればシーケンサーも消す
        if(tone.connectedSeq[i].connectedTone.length == 0){
            deleteSequencer(tone.connectedSeq[i]);
        }
    }
    deleteLine(tone);
    tone.remove();
}


////////////////////////////
//ラインの管理に関わる関数
////////////////////////////

var lineList = [];

//指定したオブジェクトに繋がれている線を消す
var deleteLine = function(obj){
    for(var j=0; j<lineList.length; j++){
        if(lineList[j].start == obj || lineList[j].target == obj){
            lineList[j].remove();
        }
    }
    //配列から削除する
    for(var j=0; j<lineList.length; j++){
        if(lineList[j].start == obj || lineList[j].target == obj){
            lineList.splice(j, 1);
        }
    }
}
