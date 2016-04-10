var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';

var loadingIcon;
var currentSeq;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx;

function init() {
    stage = new createjs.Stage('Canvas');

    $('Canvas').attr({width : windowWidth});
    $('Canvas').attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);

    //ローディングアイコンを読み込み
    var data = {};
    data.images = ['/static/img/loading.png'];
    data.frames = {width:100, height:100, regX:50, regY:50};
    data.animations = {load: [0, 16]};
    var loadingIconSheet = new createjs.SpriteSheet(data);
    loadingIcon = new createjs.Sprite(loadingIconSheet);

    createjs.EventDispatcher.initialize(Sequencer.prototype);

    //クッキーを取得
    cookie = document.cookie;
    cookie = cookie.split('=');

    //セッションがあればトップ画面は表示しない
    if(cookie[0] == 'beaker.session.id'){
        ctx = new AudioContext();
        //シーケンサーを設置
        placeSequncer(windowWidth/2, windowHeight/2);
        currentSeq = sequencerList[0];

        $(window).on('click', function(event){
            if(currentSeq == undefined){
                placeSequncer(event.pageX, event.pageY);
                currentSeq = sequencerList[0];
            }
        });
        //スケジューラを動かす
        var timerId = setInterval(function(){
            scheduler();
        }, lookahead)

        createjs.Ticker.addEventListener('tick', tick);
    //セッションがなければtwitterでログインしてもらうためトップ画面を表示
    }else{
        $('#top').fadeIn();
        $('#top .btn').on('click', function(){
            //ボタンをクリックするとtwitterの認証画面に飛ぶ
            getRequestURL()
            .done(function(response){
                location.href = response;
            })
            .fail(function() {
                console.log('Error');
            });
        });
    }
}

//twitteの認証画面に飛ばす
var getRequestURL = function(){
    return $.ajax({
        type: 'GET',
        url: 'http://k-taro.xyz/oauth/request',
        dataType: 'text'
    });
};

//右クリックを禁止
document.oncontextmenu = function(){
    return false;
};

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
        for (var j=0; j<seq.connectedTone.length; j++){
            var toneScore = seq.connectedTone[j].score;
            var toneQueue = seq.connectedTone[j].notesInQueue;
            //トーンのキューの時間が過ぎていればエフェクトを再生
            if (toneQueue.length && toneQueue[0].time < currentTime) {
                seq.connectedTone[j].noteOn();
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
