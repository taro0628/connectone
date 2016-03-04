function Obj(x, y, c, objfunc){
    this.x = x;
    this.y = y;
    this.color = c;
    this.obj = new objfunc(x, y, c, false);
    this.objBlur = new objfunc(x, y, c, true);

    this.connect = [];

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
};
Obj.prototype.move = function(x, y){
    this.x = x;
    this.y = y;
    this.obj.move(x, y);
    this.objBlur.move(x, y);
};
