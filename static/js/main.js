function init() {
    stage = new createjs.Stage("Canvas");

    $("Canvas").attr({width : windowWidth});
    $("Canvas").attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);
    createjs.Ticker.addEventListener('tick', tick);
}

$(window).on('mousedown', function(event){
    var pt;

    for(var i=0; i<sequencerList.length; i++){
        var seq = sequencerList[i];
        pt = seq.container.globalToLocal(event.pageX, event.pageY);
        //シーケンサーがクリックされたかを判定
        if(seq.container.hitTest(pt.x, pt.y)){
            isClick = true;
            moveObj = seq;
            return;
        }
        //トーンも移動できるように判定
        for(var j=0; j<seq.toneList.length; j++){
            pt = seq.toneList[j].container.globalToLocal(event.pageX, event.pageY);
            if(seq.toneList[j].container.hitTest(pt.x, pt.y)){
                isClick = true;
                moveObj = seq.toneList[j];
                return;
            }
        }
    }
});
$(window).on('mousemove', function(event){
    //オブジェクトがクリックされていたら移動処理をする
    if(isClick){
        moveObj.move(event.pageX, event.pageY);
        isMoved = true;
    }
});

$(window).on('mouseup', function(event){
    var pt;
    //オブジェクトが動いていなければ削除する
    /*if(!isMoved){
        for(var i=0; i<sequencerList.length; i++){
            pt = sequencerList[i].component.container.globalToLocal(event.pageX, event.pageY);
            //クリックした時にオブジェクトがあったら削除する
            if(sequencerList[i].component.container.hitTest(pt.x, pt.y)){
                //線の削除
                deleteLine(sequencerList[i]);
                //オブジェクトの削除
                sequencerList[i].remove();
                sequencerList.splice(i, 1);
                return;
            }
        }
    }*/

    //移動モードを解除
    if(isMoved){
        moveObj.move(event.pageX, event.pageY);
        isClick = false;
        isMoved = false;
        return;
    }

    //画面に何もなければ新しくシーケンサーを作成
    if(sequencerList.length == 0){
        placeSequncer(event.pageX, event.pageY);
        return;
    }

    //トーンをクリックした時にシーケンサーを追加する
    for(var i=0; i<sequencerList.length; i++){
        var seq = sequencerList[i];
        for (var j=0; j<seq.toneList.length; j++) {
            var tone = seq.toneList[j];
            pt = tone.container.globalToLocal(event.pageX, event.pageY);
            if(tone.container.hitTest(pt.x, pt.y)){
                //すでに繋がれているシーケンサーとは逆位置に設置
                var _x = 2*(tone.x-seq.x) + seq.x;
                var _y = 2*(tone.y-seq.y) + seq.y;
                placeSequncer(_x, _y, tone);
                isClick = false;
                isMoved = false;
                return;
            }
        }
    }

    //シーケンサーをクリックした時にトーンを追加する
    for(var i=0; i<sequencerList.length; i++){
            var seq = sequencerList[i];
            pt = seq.container.globalToLocal(event.pageX, event.pageY);
            if(seq.container.hitTest(pt.x, pt.y)){
                placeTone(seq, 'test', event.pageX, event.pageY, 90);
                isClick = false;
                isMoved = false;
                return;
            }
    }

});

function placeSequncer(x, y, tone){
//シーケンサーを設置する関数
//トーンが指定されていれば設置したシーケンサーと繋ぐ
    tone = tone || undefined;

    var seq = new Sequencer(x, y, '#96bbb3', Circle);
    sequencerList.push(seq);
    seq.display();

    //トーンが指定されていれば線を引く
    if(tone != undefined){
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
