function Rect(c, isBlur){

    this.color = c;
    this.type = 'rect';
    this.score = [9,0,9,0, 9,0,9,0, 9,0,9,0, 9,0,9,0];
    this.notesInQueue = [];
    this.container = new createjs.Container();

    this.rectBase = new createjs.Shape();
    this.rect1 = new createjs.Shape();
    this.rect2 = new createjs.Shape();
    this.rect3 = new createjs.Shape();

    this.rectBase.graphics
        .beginFill(backColor)
        .drawRect(-50, -50, 100, 100);
    this.rect1.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawRect(-50, -50, 100, 100);
    this.rect2.graphics
        .beginStroke(c)
        .setStrokeStyle(1)
        .drawRect(-40, -40, 80, 80);
    this.rect3.graphics
        .beginStroke(c)
        .setStrokeStyle(2)
        .drawRect(-30, -30, 60, 60);

    this.container.scaleX = this.container.scaleY = 0;

    //ノートオン時のエフェクトを設定
    this.effect = new createjs.Shape();
    this.effect.graphics
        .beginStroke(this.color)
        .setStrokeStyle(1)
        .drawRect(-100, -100, 200, 200);
    this.effect.scaleX = this.effect.scaleY = 0;

    if(isBlur){
        var blurFilter = new createjs.BlurFilter(0, 0, 2);
        blurFilter.blurX = blurFilter.blurY = 10;
        this.rect1.filters = [blurFilter];
        this.rect1.cache(-50, -50, 100, 100);
        this.rect2.filters = [blurFilter];
        this.rect2.cache(-50, -50, 100, 100);
        this.rect3.filters = [blurFilter];
        this.rect3.cache(-50, -50, 100, 100);

        this.effect.filters = [blurFilter];
        this.effect.cache(-100, -100, 200, 200);
    }

    this.container.hitArea = this.rectBase;
    this.container.addChild(this.rect1);
    this.container.addChild(this.rect2);
    this.container.addChild(this.rect3);

    this.container.addChild(this.effect);

    stage.addChild(this.container);
}
Rect.prototype.display = function(){
    createjs.Tween.get(this.container).to({scaleX:1, scaleY:1}, 300);
    createjs.Tween.get(this.rect1, {loop:true}).to({rotation:360}, 2000);
    createjs.Tween.get(this.rect2, {loop:true}).to({rotation:-360}, 2000);
    createjs.Tween.get(this.rect3, {loop:true}).to({rotation:360}, 1000);
};
