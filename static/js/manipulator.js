/**
Manipulator

Copyright (c) 2016 Kotaro Makino

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/
function ModuleManager(){

}
//AudioNodeを管理するオブジェクト
ModuleManager.prototype.Module = function(setModule){
    this.nodeList = [];
    this.paramList = [];
    this.type = null;

    //AudioNodeの設定を行う関数
    //引数は(Manipulatorオブジェクト, 今見ているレシピノード, AudioNodeの接続先)
    this.setModule = setModule;
};
ModuleManager.prototype.registerModule = function(name, setModule, type){
    //moduleManagerにモジュールを登録する
    this[name] = new this.Module(setModule);
    this[name].type = type;
};
ModuleManager.prototype.registerAudioNode = function(currentRecipeNode, audioNode){
    var module = this[currentRecipeNode['name']];
    //モジュールにAudioNodeを登録
    currentRecipeNode['id'] = module.nodeList.length;
    module.nodeList.push(audioNode);

    //レシピにparamが設定されていればparamListに追加
    if (currentRecipeNode['param'] != undefined){
        module.paramList.push(currentRecipeNode['param']);
    }

};
ModuleManager.prototype.getAudioNode = function(recipeNode){
    //指定したレシピノードに対応するAudioNodeを返す

    //idが付いていなければまだAudioNodeを設定できていないので失敗
    if(recipeNode['id'] == undefined){
        return false;
    }

    var module = this[recipeNode['name']];
    return module.nodeList[recipeNode['id']];
};

function Manipulator(ctx, recipe, mm){
    this.ctx = ctx;
    this.freq = 0;
    if(mm == undefined){
        this.moduleManager = new ModuleManager(); //モジュールを管理するオブジェクト
    }else{
        this.moduleManager = mm;
    }


    this.recipe = recipe;
    this.cvList = []; //周波数を設定する必要のあるAudioNodeを管理する
    this.maxRelease = 0; //エンベロープの最大リリース値

    //moduleManagerにモジュールを登録
    this.moduleManager.registerModule('Mixer', this.setMixer);
    this.moduleManager.registerModule('VCO', this.setVCO, 'VCO');
    this.moduleManager.registerModule('Env', this.setEnv, 'Env');
    this.moduleManager.registerModule('VCA', this.setVCA);
    this.moduleManager.registerModule('VCF', this.setVCF);
    this.moduleManager.registerModule('Noise', this.setNoise);
    this.moduleManager.registerModule('Delay', this.setDelay);

    //recipeをもとにAudioNodeをつなぐ
    this.setManipulator(JSON.parse(JSON.stringify(this.recipe)), this.ctx.destination);

    this.initManipulator();
}
Manipulator.prototype.initManipulator = function(){
    //オシレータを再生状態にする
    //音のON、OFFはエンベロープで管理
    for (key in this.moduleManager){
        //モジュールにVCOオプションが付いていればそのモジュールはオシレータを持っている
        if (this.moduleManager[key].type == 'VCO'){
            var nodeList = this.moduleManager[key].nodeList;
            for (var i=0; i<nodeList.length; i++){
                nodeList[i].start(0);
            }
        }
    }
};

Manipulator.prototype.noteNoTofreq = function (noteNo){
    //note番号を周波数に変換
    //9番がA(440Hz)
    return 440.0 * Math.pow(2.0, (noteNo - 9.0) / 12.0);
};

Manipulator.prototype.setManipulator = function(currentRecipeNode, destNode) {
    //レシピをもとにAudioNode作成し、destNodeにつないでいく
    var module = this.moduleManager[currentRecipeNode['name']];
    module.setModule(this, currentRecipeNode, destNode);
}

Manipulator.prototype.EnvOn = function(vca, param, time) {
    //音の鳴り始めのエンベーロープ処理
    var attack = param['attack'];
    var decay = param['decay'];
    var sustain = param['sustain'];
    var gain = param['gain'];
    this.noteOnTime = time;

    //attackとdecayが0だとノイズが出るので調整
    if(attack < 0.01){attack = 0.01;}
    if(decay < 0.01){decay = 0.01;}

    vca.gain.cancelScheduledValues(time);  // スケジュールを全て解除
    vca.gain.linearRampToValueAtTime(0.0, time);// 今時点を音の出始めとする
    vca.gain.linearRampToValueAtTime(gain, time + attack);
    // ▲ gainまでattackかけて直線的に変化
    vca.gain.linearRampToValueAtTime(sustain * gain, time + attack + decay);
    // ▲ sustain * gainまでattack+decayかけて直線的に変化

    return ;
};
Manipulator.prototype.EnvOff = function(vca, param, time) {
    //音の鳴り終わりのエンベロープ処理
    var attack = param['attack'];
    var decay = param['decay'];
    var sustain = param['sustain'];
    var gain = param['gain'];
    var release = param['release'];

    //ノートオンが終わっていなければ待つ
    if(time < this.noteOnTime + attack + decay){
        time = this.noteOnTime + attack + decay;
    }

    // 音が途切れるのを防ぐために設定
    vca.gain.setValueAtTime(sustain * gain, time);
    vca.gain.linearRampToValueAtTime(0.0, time + release);

    return;
};

Manipulator.prototype.noteOn = function(noteNo, time) {
    //音の鳴り始めの処理
    var now = this.ctx.currentTime;
    var moduleManager = this.moduleManager;

    //時間が指定されていなければすぐならす
    time = time || now;

    this.freq = this.noteNoTofreq(noteNo);

    //cvが指定してあるレシピノードに対応するAudioNodeにfrequencyを設定
    for (var i = 0; i < this.cvList.length; i++) {
        this.cvList[i].frequency.value = this.freq;
    }
    //Envが指定してあるモジュールについてエンベロープ処理を実行
    for (key in moduleManager){
        if (moduleManager[key].type == 'Env'){
            var nodeList = moduleManager[key].nodeList;
            for (var i=0; i<nodeList.length; i++){
                this.EnvOn(nodeList[i], moduleManager[key].paramList[i], time);
            }
        }
    }
};

Manipulator.prototype.noteOff = function(time){
    //音の鳴り終わりの処理
    var now = this.ctx.currentTime;
    var moduleManager = this.moduleManager;

    //時間が指定されていなければすぐならす
    time = time || now;

    //Envが指定してあるモジュールについてエンベロープ処理を実行
    for (key in moduleManager){
        if (moduleManager[key].type == 'Env'){
            //vcaのreleaseに合わせて音量を0にする
            var nodeList = moduleManager[key].nodeList;
            for (var i=0; i<nodeList.length; i++){
                this.EnvOff(nodeList[i], moduleManager[key].paramList[i], time);
            }
        }
    }
};

////////////////////////
//モジュールの設定
////////////////////////

//ミキサーを設定
Manipulator.prototype.setMixer = function(Manipulator, currentRecipeNode, destNode) {

    var input = currentRecipeNode['input'];
    //Mixerに接続されるノードの設定が終わっていなければ設定する
    for (var i = 0; i < input.length; i++) {
        Manipulator.setManipulator(input[i], destNode);
    }
    //ここまでくればinputの設定が終わっているのでdestNodeに接続
    for (var i = 0; i < input.length; i++) {
        var inputAudioNode = Manipulator.moduleManager.getAudioNode(input[i]);
        inputAudioNode.connect(destNode);
    }
    currentRecipeNode['status'] = true;
    return ;
};

Manipulator.prototype.setVCO = function(Manipulator, currentRecipeNode, destNode) {
    var vco = Manipulator.ctx.createOscillator();
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, vco);
    var param = currentRecipeNode['param'];
    var octave = 1;

    //オシレータの周波数に関する設定
    //frequencyがcvの時は外部入力の周波数を設定
    if (param['frequency'] == 'cv'){
        if(param['octave'] != undefined){
            octave =param['octave'];
        }
        vco.frequency.value = Manipulator.freq * octave;
        Manipulator.cvList.push(vco);
    //frequencyにレシピノードが設定されていればそのレシピノードをfrequencyにつなぐ
    }else if(param['frequency']['name'] != undefined){
        var paramNode = param['frequency'];
        Manipulator.setManipulator(paramNode, vco.frequency);

    //それ以外は数値とみなして代入
    }else{
        vco.frequency.value = param['frequency'];
    }
    //オシレータのデチューンを設定
    //detuneにレシピノードが設定されていればそのレシピノードをdetuneにつなぐ
    if(param['detune'] != undefined){
        if(param['detune']['name'] != undefined){
            var paramNode = param['detune'];
            Manipulator.setManipulator(paramNode, vco.detune);

        //それ以外は数値とみなして代入
        }else{
            vco.detune = param['detune'];
        }
    }
    //オシレータのタイプを設定
    vco.type = param['type'];

    //VCOノードの設定が終わったのでdestNodeに接続
    vco.connect(destNode);
    currentRecipeNode['state'] = true;
};

Manipulator.prototype.setEnv = function(Manipulator, currentRecipeNode, destNode) {
    var env = Manipulator.ctx.createGain();
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, env);

    //音を止める時に十分な時間を確保するためにreleaseの最大値を記録
    if (currentRecipeNode['param']['release'] > Manipulator.maxRelease){
        Manipulator.maxRelease = currentRecipeNode['param']['release'];
    }
    var input = currentRecipeNode['input'];

    //Envに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        Manipulator.setManipulator(input, env);
    }
    //EnvノードをdestNodeに接続
    env.gain.value = 0.0;
    env.connect(destNode);
    currentRecipeNode['state'] = true;
};

Manipulator.prototype.setVCA = function(Manipulator, currentRecipeNode, destNode) {

    var vca = Manipulator.ctx.createGain();
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, vca);

    vca.gain.value = currentRecipeNode['gain'];
    var input = currentRecipeNode['input'];

    //VCAに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        Manipulator.setManipulator(input, vca);
    }
    //VCAノードをdestNodeに接続
    vca.connect(destNode);
    currentRecipeNode['state'] = true;
};

Manipulator.prototype.setVCF = function(Manipulator, currentRecipeNode, destNode) {

    var freq = Manipulator.freq;

    var param = currentRecipeNode['param'];
    var vcf = Manipulator.ctx.createBiquadFilter();
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, vcf);

    if (param['frequency'] == 'cv'){
        vcf.frequency.value = freq;
        Manipulator.cvList.push(vcf);
    //frequencyにオブジェクトが設定されていればそのオブジェクトをfrequencyにつなぐ
    }else if(param['frequency']['name'] != undefined){
        var paramNode = param['frequency'];
        Manipulator.setManipulator(paramNode, vcf.frequency);

    //それ以外は数値とみなして代入
    }else{
        vcf.frequency.value = param['frequency'];
    }

    if(param['detune'] != undefined){
        if(param['detune']['name'] != undefined){
            var paramNode = param['detune'];
            Manipulator.setManipulator(paramNode, vcf.detune);
        //それ以外は数値とみなして代入
        }else{
            vcf.frequency.value = param['detune'];
        }
    }

    vcf.type = param['type'];
    vcf.Q.value = param['Q'];
    vcf.gain.value = param['gain'];

    var input = currentRecipeNode['input'];

    //VCFに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        Manipulator.setManipulator(input, vcf);
    }
    //VCFノードをdestNodeに接続
    vcf.connect(destNode);
    currentRecipeNode['state'] = true;
};

Manipulator.prototype.setNoise = function(Manipulator, currentRecipeNode, destNode) {

    var bufsize = 1024;
    var noise = Manipulator.ctx.createScriptProcessor(bufsize);
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, noise);
    noise.onaudioprocess = function(ev){
        var buf0 = ev.outputBuffer.getChannelData(0);
        var buf1 = ev.outputBuffer.getChannelData(1);
        for(var i = 0; i < bufsize; ++i)
            buf0[i] = buf1[i] = (Math.random() - 0.5);
    };

    //Noiseノードの設定が終わったのでdestNodeに接続
    noise.connect(destNode);
    currentRecipeNode['state'] = true;
};

Manipulator.prototype.setDelay = function(Manipulator, currentRecipeNode, destNode) {

    var delay = Manipulator.ctx.createDelay();
    Manipulator.moduleManager.registerAudioNode(currentRecipeNode, delay);
    var input = currentRecipeNode['input'];
    var param = currentRecipeNode['param'];

    var feedback = Manipulator.ctx.createGain();
    var wetlevel = Manipulator.ctx.createGain();
    var drylevel = Manipulator.ctx.createGain();

    //Delayに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        Manipulator.setManipulator(input, delay);
    }

    if(param['delayTime'] != undefined){
        if(param['delayTime']['name'] != undefined){
            var paramNode = param['delayTime'];
            Manipulator.setManipulator(paramNode, delay.delayTime);
        //それ以外は数値とみなして代入
        }else{
            delay.delayTime.value = param['delayTime'];
        }
    }

    if(param['feedback'] != undefined){
        feedback.gain.value = param['feedback'];
    }

    if(param['mix'] != undefined){
        wetlevel.gain.value = param['mix'];
        drylevel.gain.value = 1 - param['mix'];
    }

    //Delayノードの設定が終わったのでdestNodeに接続
    delay.connect(wetlevel);
    delay.connect(feedback);
    feedback.connect(delay);
    var inputAudioNode = Manipulator.moduleManager.getAudioNode(input);
    inputAudioNode.connect(drylevel);
    wetlevel.connect(destNode);
    drylevel.connect(destNode);
    currentRecipeNode['state'] = true;
};
