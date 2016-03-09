function Line(start, target, c){
    var sx = this.sx = start.x;
    var sy = this.sy = start.y;
    var tx = this.tx = target.x;
    var ty = this.ty = target.y;
    this.start = start;
    this.target = target;

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
    //始点か終点に変化があれば線を更新する
    if(this.sx!=this.start.x || this.sy!=this.start.y || this.tx!=this.target.x || this.ty!=this.target.y){
        var sx = this.sx = this.start.x;
        var sy = this.sy = this.start.y;
        var tx = this.tx = this.target.x;
        var ty = this.ty = this.target.y;
        var blurUpdate = function(_lineBlur){
            var _sx;
            var _sy;
            if(sx>tx){_sx=tx;}else{_sx=sx;}
            if(sy>ty){_sy=ty;}else{_sy=sy;}
            _lineBlur.cache(_sx, _sy, Math.abs(tx-sx), Math.abs(ty-sy));
        };

        createjs.Tween.get(this.startLine)
        .to({x:sx,y:sy}, 10)
        .call(blurUpdate,[this.lineBlur]);
        createjs.Tween.get(this.targetLine)
        .to({x:tx,y:ty},10)
        .call(blurUpdate,[this.lineBlur]);
    }
};
