function init() {
    stage = new createjs.Stage("Canvas");

    $("Canvas").attr({width : windowWidth});
    $("Canvas").attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);

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

function placeSequncer(x, y, tone){
//シーケンサーを設置する関数
//トーンが指定されていれば設置したシーケンサーと繋ぐ
    tone = tone || undefined;
    var rand = Math.random();
    var component = rand>0.5 ? Rect : Circle;
    var seq = new Sequencer(x, y, '#96bbb3', component);
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

function updateHtml() {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8001/relation',
    dataType: 'html',
    success: function(response) {
        console.log(response);
    },
    error: function() {
        console.log('えらぁ');
    },
    complete: function() {
        console.log('こんぷりーと');
    }
  });
}
