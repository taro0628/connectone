function Tone(x, y, c, text){

    this.x = x;
    this.y = y;
    this.color = c;
    this.notesInQueue = [];
    this.recipe = makeRecipe(text);
    this.pitch = makePitch(text);
    this.score = makeScore(text);
    this.container = new createjs.Container();
    this.isMoved = false;
    this.synth = new Synth(ctx, this.recipe);

    this.connectedSeq = [];

    this.text = text;
    this.string = new createjs.Text(text, "20px Arial", c);
    this.circleBase = new createjs.Shape();
    this.circleBase.on('pressmove', this.pressmove, this);
    this.circleBase.on('pressup', this.pressup, this);

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

Tone.prototype.pressmove = function(event){
    var tone = this;
    tone.move(event.stageX, event.stageY);
    tone.isMoved = true;
};
Tone.prototype.pressup = function(event){
    var tone = this;
    if(!tone.isMoved){
        if(event.nativeEvent.button == 2){
            deleteTone(tone);
        }else{
            var _x;
            var _y;
            var r = 90;
            var random = 2*Math.PI * Math.random();
            _x = r * Math.cos(random) + event.stageX;
            _y = r * Math.sin(random) + event.stageY;
            placeSequncer(_x, _y, tone);
        }
    }
    tone.isMoved = false;
};

function makeRecipe(text){
    var _text = window.btoa(encodeURI(text));
    var num = 0;
    for (var i = 0; i < _text.length; i++) {
        num += _text.charCodeAt(i);
    }

    var len = text.length;
    if(num < 1000){
        return bassdrum;
    }else if(num < 2000){
        return snare;
    }else if(num < 3000){
        return highhat;
    }else if(num < 4000){
        return tone1;
    }else if(num < 5000){
        return tone2;
    }else if(num < 6000){
        return tone3;
    }else{
        return highhat;
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

    score1 = [12,0,19,0];
    score2 = [19,0,24,0];
    score3 = [18,0,21,0];
    score4 = [14,0,18,0];

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
