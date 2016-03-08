function init() {
    stage = new createjs.Stage('Canvas');

    $('Canvas').attr({width : windowWidth});
    $('Canvas').attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);

    //ローディングアイコンを読み込み
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
