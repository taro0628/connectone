function Circle(x, y, c, isBlur){

    this.x = x;
    this.y = y;
    this.color = c;
    this.score = [9,0,9,0, 9,0,9,0, 9,0,9,0, 9,0,9,0];
    this.notesInQueue = [];
    this.recipe = recipe1;
    this.container = new createjs.Container();

    this.circleBase = new createjs.Shape();
    this.circle1 = new createjs.Shape();
    this.circle2 = new createjs.Shape();
    this.circle3 = new createjs.Shape();
    this.circle4 = new createjs.Shape();
    this.circle5 = new createjs.Shape();
    this.circle6 = new createjs.Shape();

    this.circleBase.graphics
        .beginFill(backColor)
        .drawCircle(0,0,60);
    this.circle1.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .arc(0,0,60,Math.PI*1.5,Math.PI*2);
    this.circle2.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .arc(0,0,55,Math.PI*0.5,Math.PI*1.2);
    this.circle3.graphics
        .beginStroke(c)
        .setStrokeStyle(2)
        .arc(0,0,50,Math.PI*0.0,Math.PI*0.5);
    this.circle4.graphics
        .beginStroke(c)
        .setStrokeStyle(2)
        .arc(0,0,45,Math.PI*1,Math.PI*2);
    this.circle5.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .arc(0,0,40,Math.PI*0.5,Math.PI*1);
    this.circle6.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .arc(0,0,35,Math.PI*1.5,Math.PI*2);

    this.circleBase.alpha = 0.01;
    this.container.x = x;
    this.container.y = y;
    this.container.scaleX = this.container.scaleY = 0;


    if(isBlur){
    var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        this.circle1.filters = [blurFilter];
        this.circle1.cache(-100, -100, 200, 200);
        this.circle2.filters = [blurFilter];
        this.circle2.cache(-100, -100, 200, 200);
        this.circle3.filters = [blurFilter];
        this.circle3.cache(-100, -100, 200, 200);
        this.circle4.filters = [blurFilter];
        this.circle4.cache(-100, -100, 200, 200);
        this.circle5.filters = [blurFilter];
        this.circle5.cache(-100, -100, 200, 200);
        this.circle6.filters = [blurFilter];
        this.circle6.cache(-100, -100, 200, 200);
    }

    this.container.addChild(this.circleBase);
    this.container.addChild(this.circle1);
    this.container.addChild(this.circle2);
    this.container.addChild(this.circle3);
    this.container.addChild(this.circle4);
    this.container.addChild(this.circle5);
    this.container.addChild(this.circle6);
    stage.addChild(this.container);
}
Circle.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
    createjs.Tween.get(this.circle1, {loop:true}).to({rotation:360}, 2000);
    createjs.Tween.get(this.circle2, {loop:true}).to({rotation:-360}, 2000);
    createjs.Tween.get(this.circle3, {loop:true}).to({rotation:360}, 1000);
    createjs.Tween.get(this.circle4, {loop:true}).to({rotation:360}, 2000);
    createjs.Tween.get(this.circle5, {loop:true}).to({rotation:-360}, 2000);
    createjs.Tween.get(this.circle6, {loop:true}).to({rotation:360}, 1000);
};
Circle.prototype.noteOn = function(){
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
Circle.prototype.remove =  function(){
    createjs.Tween.get(this.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this)});
};
Circle.prototype.move = function(_x, _y){
    createjs.Tween.get(this.container,{override:true})
    .to({x:_x, y:_y}, 100)
    .call(function(){this.x=_x;this.y=_y});
};
