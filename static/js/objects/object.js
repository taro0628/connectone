function Obj(x, y, c, objfunc){
    this.x = x;
    this.y = y;
    this.color = c;
    this.obj = new objfunc(x, y, c, false);
    this.objBlur = new objfunc(x, y, c, true);

    this.connect = [];

    this.textList = [];

    this.nextObjs = [];

    this.score = this.obj.score;
    this.notesInQueue = [];
    this.recipe = recipe1;
}
Obj.prototype.display = function(){
    this.obj.display();
    this.objBlur.display();
}
Obj.prototype.noteOn = function(){
    this.obj.noteOn();
}
Obj.prototype.remove = function(){
    this.obj.remove();
    this.objBlur.remove();
    for (var i = 0; i < this.textList.length; i++) {
        this.textList[i].remove();
    }
};
Obj.prototype.move = function(x, y){
    this.x = x;
    this.y = y;
    this.obj.move(x, y);
    this.objBlur.move(x, y);

    var divCount = this.textList.length;
    var radianInterval = (2 * Math.PI) / divCount;
    var _x;
    var _y;
    for (var i = 0; i < divCount; i++) {
        _x = this.r * Math.cos(radianInterval * i) + x
        _y = this.r * Math.sin(radianInterval * i) + y
        this.textList[i].move(_x, _y);
        this.textList[i].x = _x;
        this.textList[i].y = _y;
    }
};
