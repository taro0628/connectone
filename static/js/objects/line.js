function Line(start, target, c){
    var sx = this.sx = start.x;
    var sy = this.sy = start.y;
    var tx = this.tx = target.x;
    var ty = this.ty = target.y;
    this.start = start;
    this.target = target;
    start.connect.push(target);
    target.connect.push(start);

    this.line = new createjs.Shape();
    this.lineBlur = new createjs.Shape();

    this.startLine = new createjs.Graphics.MoveTo(sx,sy);
    this.targetLine = new createjs.Graphics.LineTo(tx,ty);
    this.line.graphics.append(createjs.Graphics.beginCmd);
    this.line.graphics.append(this.startLine);
    this.line.graphics.append(this.targetLine);
    this.line.graphics.append(new createjs.Graphics.Stroke(c));
    this.line.graphics.append(new createjs.Graphics.StrokeStyle(1));

    this.lineBlur.graphics.append(createjs.Graphics.beginCmd);
    this.lineBlur.graphics.append(this.startLine);
    this.lineBlur.graphics.append(this.targetLine);
    this.lineBlur.graphics.append(new createjs.Graphics.Stroke(c));
    this.lineBlur.graphics.append(new createjs.Graphics.StrokeStyle(1));

    var blurFilter = new createjs.BlurFilter(0, 0, 2);
    blurFilter.blurX = blurFilter.blurY = 10;
    this.lineBlur.filters = [blurFilter];
    var _sx;
    var _sy;
    if(sx>tx){_sx=tx;}else{_sx=sx;}
    if(sy>ty){_sy=ty;}else{_sy=sy;}
    this.lineBlur.cache(_sx, _sy, Math.abs(tx-sx), Math.abs(ty-sy));
    stage.addChild(this.line);
    stage.addChild(this.lineBlur);
}

Line.prototype.remove = function(){
    createjs.Tween.get(this.line)
        .to({alpha:0},300)
        .call(function(){stage.removeChild(this)});
    createjs.Tween.get(this.lineBlur)
        .to({alpha:0},300)
        .call(function(){stage.removeChild(this)});
};
Line.prototype.update = function(){
    if(this.sx!=this.start.x || this.sy!=this.start.y || this.tx!=this.target.x || this.ty!=this.target.y){
        var sx = this.sx = this.start.x;
        var sy = this.sy = this.start.y;
        var tx = this.tx = this.target.x;
        var ty = this.ty = this.target.y;


        createjs.Tween.get(this.startLine)
        .to({x:sx,y:sy}, 100);
        createjs.Tween.get(this.targetLine)
        .to({x:tx,y:ty},100)
        .call(function(_lineBlur){
            var _sx;
            var _sy;
            if(sx>tx){_sx=tx;}else{_sx=sx;}
            if(sy>ty){_sy=ty;}else{_sy=sy;}
            _lineBlur.cache(_sx, _sy, Math.abs(tx-sx), Math.abs(ty-sy));
        },[this.lineBlur]);
    }
};

//targetに一番近いオブジェクトに向かって線を引く
var drawLine = function (target){
    var l = objectList.length;
    var nodeNum = 0;
    var mindist = 10000000000;
    for(var i=0; i<l-1; i++){
        var _x =  (objectList[i].x-target.x);
        var _y =  (objectList[i].y-target.y);
        var dist = _x*_x + _y*_y;
        if(mindist>dist){
            mindist = dist;
            nodeNum = i;
        }
    }
    lineList.push(new Line(objectList[nodeNum], target, '#fff'));
}

//指定したオブジェクトに繋がれている線を消す
var deleteLine = function(obj){
    for(var j=0; j<lineList.length; j++){
        if(lineList[j].start == obj || lineList[j].target == obj){
            lineList[j].remove();
            removeConnection(lineList[j]);
        }
    }
    //配列から削除する
    for(var j=0; j<lineList.length; j++){
        if(lineList[j].start == obj || lineList[j].target == obj){
            lineList.splice(j, 1);
        }
    }
}

var removeConnection = function(line){

    var isConnect= true;
    var connectNum;

    while(isConnect){
        connectNum = $.inArray(line.target, line.start.connect);
        if(connectNum != -1){
            line.start.connect.splice(connectNum, 1);
        }else{
            isConnect = false;
        }
    }
    isConnect= true;
    while(isConnect){
        connectNum = $.inArray(line.start, line.target.connect);
        if(connectNum != -1){
            line.target.connect.splice(connectNum, 1);
        }else{
            isConnect = false;
        }
    }
}
