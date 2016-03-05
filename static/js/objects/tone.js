function Tone(x, y, c, text){

    this.x = x;
    this.y = y;
    this.color = c;
    this.notesInQueue = [];
    this.recipe = makeRecipe(text);
    this.pitch = makePitch(text);
    this.container = new createjs.Container();

    this.connectedSeq = [];

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
Tone.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
};
Tone.prototype.noteOn = function(){
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
Tone.prototype.remove =  function(){
    createjs.Tween.get(this.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this)});
};
Tone.prototype.move = function(_x, _y){
    createjs.Tween.get(this.container,{override:true})
    .to({x:_x, y:_y}, 100)
    .call(function(){this.x=_x;this.y=_y;});
    this.x = _x;
    this.y = _y;
};

function makeRecipe(text){
    var len = Math.random() * 9;
    len = text.length;
    if(len < 3){
        return recipe1;
    }else if(len < 6){
        return recipe2;
    }else if(len < 9){
        return recipe3;
    }else{
        return recipe1;
    }
}

function makePitch(text){
    len = Math.random() * 9;
    if(len < 3){
        return 9;
    }else if(len < 6){
        return 11;
    }else if(len < 9){
        return 13;
    }else{
        return 15;
    }
}

function makeScore(text){
    var len = Math.floor(Math.random() * 12);

    score1 = [7,0,0,0];
    score2 = [11,0,9,0];
    score3 = [0,5,0,9];
    score4 = [9,0,8,0];

    if(len < 3){
        return score1.concat(score3).concat(score2).concat(score1);
    }else if(len < 6){
        return score3.concat(score2).concat(score2).concat(score3);
    }else if(len < 9){
        return score2.concat(score4).concat(score4).concat(score1);
    }else{
        return score2.concat(score3).concat(score3).concat(score2);
    }
}
