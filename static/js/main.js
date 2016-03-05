function init() {
    stage = new createjs.Stage("Canvas");

    $("Canvas").attr({width : windowWidth});
    $("Canvas").attr({height : windowHeight});
    var background = new createjs.Shape();
    background.graphics.beginFill('#0E0E0E').drawRect(0,0,windowWidth,windowHeight);
    stage.addChild(background);
    createjs.Ticker.addEventListener('tick', tick);
}

var isClick = false;//オブジェクトがクリックされたかのフラグ
var isMoved = false;//オブジェクトが移動したかのフラグ
var moveObj = undefined;//クリックされたオブジェクト
$(window).on('mousedown', function(event){
    var pt;

    for(var i=0; i<sequencerList.length; i++){
        pt = sequencerList[i].component.container.globalToLocal(event.pageX, event.pageY);
        //シーケンサーがクリックされたかを判定
        if(sequencerList[i].component.container.hitTest(pt.x, pt.y)){
            isClick = true;
            moveObj = sequencerList[i];
            return;
        }
        //トーンも移動できるように判定
        for(var j=0; j<sequencerList[i].toneList.length; j++){
            pt = sequencerList[i].toneList[j].container.globalToLocal(event.pageX, event.pageY);
            if(sequencerList[i].toneList[j].container.hitTest(pt.x, pt.y)){
                isClick = true;
                moveObj = sequencerList[i].toneList[j];
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
    var lineIds;
    var target;
    //オブジェクトが動いていなければ削除する
    if(!isMoved){
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
    }

    //移動モードを解除
    if(isClick){
        moveObj.move(event.pageX, event.pageY);
        isClick = false;
        isMoved = false;
        return;
    }

    //画面に何もなければ新しくシーケンサーを作成
    if(sequencerList.length == 0){
        createObj(event.pageX, event.pageY);
        return;
    }

    //トーンをクリックした時にシーケンサーを追加する
    for(var i=0; i<sequencerList.length; i++){
        for (var j=0; j<sequencerList[i].toneList.length; j++) {
            var tone = sequencerList[i].toneList[j];
            pt = tone.container.globalToLocal(event.pageX, event.pageY);
            if(tone.container.hitTest(pt.x, pt.y)){
                var _x = 3*(tone.x-sequencerList[i].x) + sequencerList[i].x;
                var _y = 3*(tone.y-sequencerList[i].y) + sequencerList[i].y;
                createObj(_x, _y, tone);
                return;
            }
        }
    }

});

function createObj(pageX, pageY, tone){

    var seq = new Sequencer(pageX, pageY, '#96bbb3', Circle);
    sequencerList.push(seq);
    seq.display();
    if(currentSeq == undefined){
        currentSeq = seq;
    }

    placeTone(seq, ['t1', 'test2', 'testaaaaaaaaa3'], pageX, pageY, 100)

    //他にシーケンサーがあれば線を引く
    if(sequencerList.length>1){
        lineList.push(new Line(seq, tone, '#fff'));
    }
}

function placeTone(sequencer, textArray, x, y, r){
    var divCount = textArray.length;
    var radianInterval = (2 * Math.PI) / divCount;
    var _x;
    var _y;
    sequencer.r = r;
    for (var i = 0; i < divCount; i++) {
        _x = r * Math.cos(radianInterval * i) + x;
        _y = r * Math.sin(radianInterval * i) + y;
        var tone = new Tone(_x, _y, '#96bbb3', textArray[i]);
        sequencer.toneList.push(tone);
        tone.display();
        tone.connectedSeq.push(sequencer);
        lineList.push(new Line(sequencer, tone, '#fff'));
    }
}

function tick() {
    var currentTime = ctx.currentTime;

    for(var i=0; i<sequencerList.length; i++){
        var objScore = sequencerList[i].score;
        var objQueue = sequencerList[i].notesInQueue;
        if (objQueue.length && objQueue[0].time < currentTime) {

            sequencerList[i].noteOn();
            objQueue.splice(0,1);   // remove note from queue
        }
        for (var j=0; j<sequencerList[i].toneList.length; j++){
            var toneScore = sequencerList[i].toneList[j].score;
            var toneQueue = sequencerList[i].toneList[j].notesInQueue;

            if (toneQueue.length && toneQueue[0].time < currentTime) {
                sequencerList[i].toneList[j].noteOn();
                toneQueue.splice(0,1);   // remove note from queue
            }
        }
    }

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
