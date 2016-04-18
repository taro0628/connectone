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
    this.container.on('mouseover', this.mouseover, this);
    this.container.on('mouseout', this.mouseout, this);
    this.container.on('pressmove', this.pressmove, this);
    this.container.on('pressup', this.pressup, this);

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

    //ノートオン時のエフェクトを設定
    this.effect = new createjs.Shape();
    this.effect.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawCircle(0,0,100);
    this.effect.scaleX = this.effect.scaleY = 0;
    this.effectBlur = new createjs.Shape();
    this.effectBlur.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawCircle(0,0,100);
    this.effectBlur.scaleX = this.effectBlur.scaleY = 0;
    var blurFilter = new createjs.BlurFilter(0, 0, 2);
    blurFilter.blurX = blurFilter.blurY = 10;
    this.effectBlur.filters = [blurFilter];
    this.effectBlur.cache(-100, -100, 200, 200);
    this.container.addChild(this.effect);
    this.container.addChild(this.effectBlur);

}
Tone.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
};
Tone.prototype.noteOn = function(){
    createjs.Tween.get(this.effect)
        .to({scaleX:1, scaleY:1}, 300)
        .to({scaleX:0, scaleY:0}, 300);
    createjs.Tween.get(this.effectBlur)
        .to({scaleX:1, scaleY:1}, 300)
        .to({scaleX:0, scaleY:0}, 300);
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

Tone.prototype.mouseover = function(event){
    this.container.cursor = 'pointer';
    createjs.Tween.get(this.container)
        .to({alpha:0.6}, 100);
};
Tone.prototype.mouseout = function(event){
    this.container.cursor = 'normal';
    createjs.Tween.get(this.container)
        .to({alpha:1}, 100);
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
            //右クリックの時はトーンを消去する
            deleteTone(tone);
        }else{
            //クリックの時はシーケンサーを設置する
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
    var _text = window.btoa(encodeURI(text));
    var num = 0;
    for (var i = 0; i < _text.length; i++) {
        num += _text.charCodeAt(i);
    }

    if(num < 3){
        return 9;
    }else if(num < 6){
        return 11;
    }else if(num < 9){
        return 13;
    }else{
        return 15;
    }
}

function makeScore(text){
    var len = Math.floor(Math.random() * 12);

    score1 = [12,0,19,0];
    score2 = [19,0,24,0];
    score3 = [18,21,0,0];
    score4 = [14,0,18,18];

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
