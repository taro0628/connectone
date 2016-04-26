function Triangle(c, isBlur){

    this.color = c;
    this.type = 'triangle';
    this.score = [9,9,9,0, 0,0,9,0, 9,9,9,0, 0,0,9,0];
    this.notesInQueue = [];
    this.container = new createjs.Container();

    this.triangleBase = new createjs.Shape();
    this.triangle1 = new createjs.Shape();
    this.triangle2 = new createjs.Shape();
    this.triangle3 = new createjs.Shape();

    this.triangleBase.graphics
        .beginFill(backColor)
        .drawPolyStar(0, 0, 70, 3, 0, -90);
    this.triangle1.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawPolyStar(0, 0, 70, 3, 0, 0);
    this.triangle2.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawPolyStar(0, 0, 50, 3, 0, -90);
    this.triangle3.graphics
        .beginStroke(c)
        .setStrokeStyle(2)
        .drawPolyStar(0, 0, 30, 3, 0, 90);

    this.container.scaleX = this.container.scaleY = 0;

    //ノートオン時のエフェクトを設定
    this.effect = new createjs.Shape();
    this.effect.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawPolyStar(0, 0, 150, 3, 0, 0);
    this.effect.scaleX = this.effect.scaleY = 0;

    if(isBlur){
        var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        this.triangle1.filters = [blurFilter];
        this.triangle1.cache(-100, -100, 200, 200);
        this.triangle2.filters = [blurFilter];
        this.triangle2.cache(-100, -100, 200, 200);
        this.triangle3.filters = [blurFilter];
        this.triangle3.cache(-100, -100, 200, 200);

        this.effect.filters = [blurFilter];
        this.effect.cache(-200, -200, 400, 400);
    }

    this.container.hitArea = this.triangleBase;
    this.container.addChild(this.triangle1);
    this.container.addChild(this.triangle2);
    this.container.addChild(this.triangle3);

    this.container.addChild(this.effect);

    stage.addChild(this.container);
}
Triangle.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
    createjs.Tween.get(this.triangle1, {loop:true}).to({rotation:360}, 2000);
    createjs.Tween.get(this.triangle2, {loop:true}).to({rotation:-360}, 2000);
    createjs.Tween.get(this.triangle3, {loop:true}).to({rotation:360}, 1000);
};
