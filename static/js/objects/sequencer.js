function Sequencer(x, y, statuses_count, favourites_count, words, iconSrc){
    this.x = x;
    this.y = y;

    this.color = this.makeColor(statuses_count);
    var component = this.makeComponent(favourites_count);

    this.component = new component(x, y, this.color, false);
    this.container = this.component.container;
    this.container.on('mouseover', this.mouseover, this);
    this.container.on('mouseout', this.mouseout, this);
    this.container.on('pressmove', this.pressmove, this);
    this.container.on('pressup', this.pressup, this);
    this.isMoved = false;

    var icon = new createjs.Bitmap(iconSrc);
    icon.x = -icon.getBounds().width/2;
    icon.y = -icon.getBounds().height/2;
    this.container.addChild(icon);

    this.componentBlur = new component(x, y, this.color, true);

    this.connectedTone = [];

    this.score = this.component.score;
    this.notesInQueue = [];

    this.words = words;
}
Sequencer.prototype.display = function(){
    this.component.display();
    this.componentBlur.display();
}
Sequencer.prototype.noteOn = function(){
    this.component.noteOn();
    this.componentBlur.noteOn();
}
Sequencer.prototype.remove = function(){
    this.component.remove();
    this.componentBlur.remove();
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

    this.component.move(event.stageX, event.stageY);
    this.componentBlur.move(event.stageX, event.stageY);

    seq.isMoved = true;
};
Sequencer.prototype.pressup = function(event){
    var seq = this;
    //移動モードを解除
    if(!seq.isMoved){
        //右クリックの時はシーケンサーを消去する
        if(event.nativeEvent.button == 2){
            deleteSequencer(seq);
        }else{
            //クリックの時はトーンを設置する
            text = seq.words[0];
            //一度使った単語はもう使わない
            seq.words.splice(0, 1);
            placeTone(seq, text, seq.x, seq.y, 90);
        }
    }
    seq.isMoved = false;
};

Sequencer.prototype.makeColor = function(statuses_count){
    if(statuses_count>20000){
        return'#9696aa';
    }else if(statuses_count>15000){
        return'#bb96b3';
    }else if(statuses_count>5000){
        return'#b3bb96';
    }else{
        return'#96bbb3';
    }
};

Sequencer.prototype.makeComponent = function(statuses_count){
    if(statuses_count>1000){
        return Rect;
    }else{
        return Circle;
    }
};
