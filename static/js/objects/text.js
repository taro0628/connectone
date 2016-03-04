function Text(x, y, c, text){

    this.x = x;
    this.y = y;
    this.color = c;
    this.score = [9,0,0,0, 9,0,9,0, 0,0,0,0, 0,0,0,0];
    this.notesInQueue = [];
    this.recipe = recipe1;
    this.container = new createjs.Container();

    this.string = new createjs.Text(text, "20px Arial", c);
    this.circleBase = new createjs.Shape();

    this.string.textAlign = "center"; // 水平中央に
    this.string.textBaseline = "middle"; // 垂直中央に

    this.circleBase.graphics
        .beginFill('#fff')
        .drawCircle(0,0,30);

    this.circleBase.alpha = 0.1;
    this.container.x = x;
    this.container.y = y;
    this.container.scaleX = this.container.scaleY = 0;

    this.container.addChild(this.circleBase);
    this.container.addChild(this.string);

    stage.addChild(this.container);
}
Text.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
};
Text.prototype.noteOn = function(){
    var effect = new createjs.Shape();
    effect.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawCircle(0,0,100);
    effect.scaleX = effect.scaleY = 0;
    createjs.Tween.get(effect)
        .to({scaleX:1, scaleY:1}, 300)
        .to({scaleX:0, scaleY:0}, 300)
        .call(function(){stage.removeChild(this)});

    var effectBlur = new createjs.Shape();
    effectBlur.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawCircle(0,0,100);
    effectBlur.scaleX = effectBlur.scaleY = 0;
    createjs.Tween.get(effectBlur)
        .to({scaleX:1, scaleY:1}, 300)
        .to({scaleX:0, scaleY:0}, 300)
        .call(function(){stage.removeChild(this)});
    var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        effectBlur.filters = [blurFilter];
        effectBlur.cache(-100, -100, 200, 200);
    this.container.addChild(effect);
    this.container.addChild(effectBlur);
};
Text.prototype.remove =  function(){
    createjs.Tween.get(this.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this)});
};
Text.prototype.move = function(_x, _y){
    createjs.Tween.get(this.container,{override:true})
    .to({x:_x, y:_y}, 100)
    .call(function(){this.x=_x;this.y=_y});
};
