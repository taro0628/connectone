function Sequencer(x, y, c, component){
    this.x = x;
    this.y = y;
    this.color = c;
    this.component = new component(x, y, c, false);
    this.componentBlur = new component(x, y, c, true);

    this.toneList = [];

    this.score = this.component.score;
    this.notesInQueue = [];
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
