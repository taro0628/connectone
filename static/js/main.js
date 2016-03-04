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

    for(var i=0; i<objectList.length; i++){
        pt = objectList[i].obj.container.globalToLocal(event.pageX, event.pageY);
        //オブジェクトがクリックされたかを判定
        if(objectList[i].obj.container.hitTest(pt.x, pt.y)){
            isClick = true;
            moveObj = objectList[i];
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
        for(var i=0; i<objectList.length; i++){
            pt = objectList[i].obj.container.globalToLocal(event.pageX, event.pageY);
            //クリックした時にオブジェクトがあったら削除する
            if(objectList[i].obj.container.hitTest(pt.x, pt.y)){
                //線の削除
                deleteLine(objectList[i]);
                //オブジェクトの削除
                objectList[i].remove();
                objectList.splice(i, 1);
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

    //何もなければ新しくオブジェクトを作成
    objectList.push(new Obj(event.pageX, event.pageY, '#96bbb3', CirclePart));
    objectList[objectList.length-1].display();
    if(currentObj == undefined){
        currentObj = objectList[objectList.length-1];
    }
    //他にオブジェクトがあれば線を引く
    if(objectList.length>1){
        drawLine(objectList[objectList.length-1]);
    }
});

function tick() {
    var currentTime = ctx.currentTime;

    for(var i=0; i<objectList.length; i++){
        var objScore = objectList[i].score;
        var objQueue = objectList[i].notesInQueue;

        if (objQueue.length && objQueue[0].time < currentTime) {
            objectList[i].noteOn();
            objQueue.splice(0,1);   // remove note from queue
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
