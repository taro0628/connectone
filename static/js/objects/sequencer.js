function Sequencer(x, y, words, iconSrc){
    this.x = x;
    this.y = y;

    this.color = '#96bbb3';
    var rand = Math.random();
    var component = rand>0.5 ? Rect : Circle;
    var component = Circle;

    this.component = new component(x, y, this.color, false);
    this.container = this.component.container;
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
