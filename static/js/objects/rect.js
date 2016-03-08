function Rect(x, y, c, isBlur){

    this.x = x;
    this.y = y;
    this.color = c;
    this.score = [9,0,9,0, 9,0,9,0, 9,0,9,0, 9,0,9,0];
    this.notesInQueue = [];
    this.container = new createjs.Container();

    this.rectBase = new createjs.Shape();
    this.rect1 = new createjs.Shape();
    this.rect2 = new createjs.Shape();
    this.rect3 = new createjs.Shape();

    this.rectBase.graphics
        .beginFill(backColor)
        .drawRect(-50, -50, 100, 100);
    this.rect1.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawRect(-50, -50, 100, 100);
    this.rect2.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawRect(-40, -40, 80, 80);
    this.rect3.graphics
        .beginStroke(c)
        .setStrokeStyle(2)
        .drawRect(-30, -30, 60, 60);

    this.container.x = x;
    this.container.y = y;
    this.container.scaleX = this.container.scaleY = 0;


    if(isBlur){
    var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        this.rect1.filters = [blurFilter];
        this.rect1.cache(-50, -50, 100, 100);
        this.rect2.filters = [blurFilter];
        this.rect2.cache(-50, -50, 100, 100);
        this.rect3.filters = [blurFilter];
        this.rect3.cache(-50, -50, 100, 100);
    }

    this.container.hitArea = this.rectBase;
    this.container.addChild(this.rect1);
    this.container.addChild(this.rect2);
    this.container.addChild(this.rect3);
    stage.addChild(this.container);
}
Rect.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
    createjs.Tween.get(this.rect1, {loop:true}).to({rotation:360}, 2000);
    createjs.Tween.get(this.rect2, {loop:true}).to({rotation:-360}, 2000);
    createjs.Tween.get(this.rect3, {loop:true}).to({rotation:360}, 1000);
};
Rect.prototype.noteOn = function(){
    var effect = new createjs.Shape();
    effect.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawRect(-100, -100, 200, 200);
    effect.scaleX = effect.scaleY = 0;
    createjs.Tween.get(effect)
        .to({scaleX:1, scaleY:1, rotation:360}, 300)
        .to({scaleX:0, scaleY:0}, 300)
        .call(function(){stage.removeChild(this)});

    var effectBlur = new createjs.Shape();
    effectBlur.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawRect(-100, -100, 200, 200);
    effectBlur.scaleX = effectBlur.scaleY = 0;
    createjs.Tween.get(effectBlur)
        .to({scaleX:1, scaleY:1, rotation:360}, 300)
        .to({scaleX:0, scaleY:0}, 300)
        .call(function(){stage.removeChild(this)});

    var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        effectBlur.filters = [blurFilter];
        effectBlur.cache(-100, -100, 200, 200);
    this.container.addChild(effect);
    this.container.addChild(effectBlur);
};
Rect.prototype.remove =  function(){
    createjs.Tween.get(this.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this)});
};
Rect.prototype.move = function(_x, _y){
    createjs.Tween.get(this.container,{override:true})
    .to({x:_x, y:_y}, 100)
    .call(function(){this.x=_x;this.y=_y});
};
