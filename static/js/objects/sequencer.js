function Sequencer(x, y, c, component, words, iconSrc){
    this.x = x;
    this.y = y;
    this.color = c;
    this.component = new component(x, y, c, false);
    this.container = this.component.container;
    this.container.on('pressmove', this.pressmove, this);
    this.container.on('pressup', this.pressup, this);
    this.isMoved = false;

    var icon = new createjs.Bitmap(iconSrc);
    icon.x = -icon.getBounds().width/2;
    icon.y = -icon.getBounds().height/2;
    this.container.addChild(icon);

    this.componentBlur = new component(x, y, c, true);

    this.toneList = [];

    this.score = this.component.score;
    this.notesInQueue = [];

    this.words = words;
}
Sequencer.prototype.display = function(){
    this.component.display();
    this.componentBlur.display();
}
Sequencer.prototype.noteOn = function(){
    this.component.noteOn();
}
Sequencer.prototype.remove = function(){
    this.component.remove();
    this.componentBlur.remove();
    for (var i = 0; i < this.toneList.length; i++) {
        this.toneList[i].remove();
    }
};
Sequencer.prototype.move = function(x, y){
    this.x = x;
    this.y = y;
    this.component.move(x, y);
    this.componentBlur.move(x, y);
};
Sequencer.prototype.pressmove = function(event){
    var seq = this;
    seq.move(event.stageX, event.stageY);
    seq.isMoved = true;
};
Sequencer.prototype.pressup = function(event){
    var seq = this;
    //移動モードを解除
    if(!seq.isMoved){
        rand = Math.floor(Math.random() * this.words.length);
        text = this.words[rand];
        //一度使った単語はもう使わない
        this.words.splice(rand,1);
        placeTone(seq, text, seq.x, seq.y, 90);
    }
    seq.isMoved = false;
};

function placeSequncer(x, y, tone) {

    //ローディングアイコンを表示
    loadingIcon.x = x;
    loadingIcon.y = y;
    loadingIcon.scaleX = 0;
    loadingIcon.scaleY = 0;
    loadingIcon.gotoAndPlay("load");
    stage.addChild(loadingIcon);
    createjs.Tween.get(loadingIcon)
        .to({scaleX: 0.7, scaleY: 0.7}, 100);

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
        //アイコン画像、固有名詞が揃ったのでシーケンサーを作成
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

function createSequncer(x, y, tone, words, iconSrc){
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
        tone.connectedSeq.push(seq);
        lineList.push(new Line(seq, tone, '#fff'));
    }
}
