function Sequencer(x, y, screenName, statusesCount, favouritesCount, words, iconSrc){
    this.x = x;
    this.y = y;

    this.color = this.makeColor(statusesCount);
    this.connectedTone = [];
    this.notesInQueue = [];
    this.words = words;
    var component = this.makeComponent(favouritesCount);

    //コンポーネントを表示
    this.component = new component(this.color, false);
    this.container = this.component.container;
    this.container.x = x;
    this.container.y = y;
    this.score = this.component.score;

    this.componentBlur = new component(this.color, true);
    this.componentBlur.container.x = x;
    this.componentBlur.container.y = y;

    //アイコンを表示
    var icon = new createjs.Bitmap(iconSrc);
    icon.x = -icon.getBounds().width/2;
    icon.y = -icon.getBounds().height/2;
    this.container.addChild(icon);

    //スクリーンネームを表示
    this.screenName = screenName;
    this.string = new createjs.Text(screenName, "20px Arial", this.color);
    this.string.textAlign = 'center'; // 水平中央に
    this.string.y = 60;
    this.container.addChild(this.string);

    this.container.on('mouseover', this.mouseover, this);
    this.container.on('mouseout', this.mouseout, this);
    this.container.on('pressmove', this.pressmove, this);
    this.container.on('pressup', this.pressup, this);
    this.isMoved = false;
}
Sequencer.prototype.display = function(){
    this.component.display();
    this.componentBlur.display();
}
Sequencer.prototype.noteOn = function(){
    //音が出るときのエフェクトを表示
    createjs.Tween.get(this.component.effect)
        .to({scaleX:1, scaleY:1, rotation:360}, 300)
        .to({scaleX:0, scaleY:0}, 300);
    createjs.Tween.get(this.componentBlur.effect)
        .to({scaleX:1, scaleY:1, rotation:360}, 300)
        .to({scaleX:0, scaleY:0}, 300);
}
Sequencer.prototype.remove = function(){
    //消去時のアニメーション
    createjs.Tween.get(this.component.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this.component)});

    createjs.Tween.get(this.componentBlur.container,{override:true})
    .to({scaleX:0, scaleY:0}, 300)
    .call(function(){stage.removeChild(this.componentBlur)});
};
Sequencer.prototype.mouseover = function(event){
    var seq = this;
    this.container.cursor = 'pointer';
    createjs.Tween.get(this.container)
        .to({alpha:0.6}, 100);
};
Sequencer.prototype.mouseout = function(event){
    var seq = this;
    this.container.cursor = 'normal';
    createjs.Tween.get(this.container)
        .to({alpha:1}, 100);
};
Sequencer.prototype.pressmove = function(event){
    var seq = this;

    this.x = event.stageX;
    this.y = event.stageY;

    createjs.Tween.get(this.component.container,{override:true})
    .to({x:this.x, y:this.y}, 100);

    createjs.Tween.get(this.componentBlur.container,{override:true})
    .to({x:this.x, y:this.y}, 100);

    seq.isMoved = true;
};
Sequencer.prototype.pressup = function(event){
    var seq = this;
    //移動モードを解除
    if(!seq.isMoved){
        //右クリックの時はシーケンサーを消去する
        //if(event.nativeEvent.button == 2){
        //    deleteSequencer(seq);
        //}else{
            //クリックの時はトーンを設置する
            text = seq.words[0];
            //一度使った単語はもう使わない
            seq.words.splice(0, 1);
            placeTone(seq, text, seq.x, seq.y, 90);
        //}
    }
    seq.isMoved = false;
};

Sequencer.prototype.makeColor = function(statusesCount){
    if(statusesCount>20000){
        return'#9696aa';
    }else if(statusesCount>15000){
        return'#bb96b3';
    }else if(statusesCount>5000){
        return'#b3bb96';
    }else{
        return'#96bbb3';
    }
};

Sequencer.prototype.makeComponent = function(statusesCount){
    if(statusesCount<500){
        return Rect;
    }else if (statusesCount<1000) {
        return Circle;
    }else{

        return Triangle;
    }
};
