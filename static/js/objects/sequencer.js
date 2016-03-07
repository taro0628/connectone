function Sequencer(x, y, c, component, words, iconSrc){
    this.x = x;
    this.y = y;
    this.color = c;
    this.component = new component(x, y, c, false);
    this.container = this.component.container;
    this.container.on('mousedown', this.mousedown, this);
    this.container.on('pressmove', this.mousemove, this);
    this.container.on('pressup', this.mouseup, this);
    this.isMoved = false;

    var icon = new createjs.Bitmap(iconSrc);
    icon.x = -icon.getBounds().width/2;
    icon.y = -icon.getBounds().height/2;
    this.container.addChild(icon);

    this.componentBlur = new component(x, y, c, true);

    this.toneList = [];

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
}
Sequencer.prototype.remove = function(){
    this.component.remove();
    this.componentBlur.remove();
    for (var i = 0; i < this.toneList.length; i++) {
        this.toneList[i].remove();
    }
};
Sequencer.prototype.move = function(x, y){
    this.x = x;
    this.y = y;
    this.component.move(x, y);
    this.componentBlur.move(x, y);
};
Sequencer.prototype.mousedown = function(event){
    var seq = event.target.sequencer;
};
Sequencer.prototype.mousemove = function(event){
    var seq = this;
    seq.move(event.stageX, event.stageY);
    seq.isMoved = true;
};
Sequencer.prototype.mouseup = function(event){
    var seq = this;
    //移動モードを解除
    if(!seq.isMoved){
        rand = Math.floor(Math.random() * this.words.length);
        text = this.words[rand];
        placeTone(seq, text, seq.x, seq.y, 90);
    }
    seq.isMoved = false;
};
