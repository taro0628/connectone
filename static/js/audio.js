//AudioNodeを管理するオブジェクト
function Module(setModule){
    this.nodeList = new Array(10);
    this.paramList = new Array(10);
    this.nodeCount = 0;
    this.type = null;

    //AudioNodeの設定を行う関数
    //引数は(Synthオブジェクト, 今見ているレシピノード, AudioNodeの接続先, モジュール)
    this.setModule = setModule;
}

function Synth(ctx, recipe){
    this.ctx = ctx;
    this.freq = 0;
    this.moduleManager = {}; //モジュールを管理するオブジェクト
    this.recipe = recipe;
    this.cvList = []; //周波数を設定する必要のあるAudioNodeを管理する

    //moduleManagerにモジュールを登録
    this.registerModule('Mixer', this.setMixer);
    this.registerModule('VCO', this.setVCO, 'VCO');
    this.registerModule('Env', this.setEnv, 'Env');
    this.registerModule('VCA', this.setVCA);
    this.registerModule('VCF', this.setVCF);
    this.registerModule('Noise', this.setNoise);
    this.registerModule('Delay', this.setDelay);

    this.initSynth();
    this.setSynth(JSON.parse(JSON.stringify(this.recipe)), this.ctx.destination);
    for (key in this.moduleManager){
        if (this.moduleManager[key].type == 'VCO'){
            for (var i=0; i<this.moduleManager[key].nodeCount; i++){
                this.moduleManager[key].nodeList[i].start(0);
            }
        }
    }
}
Synth.prototype.initSynth = function(){
    //moduleManagerを初期化
    for (key in this.moduleManager){
        this.moduleManager[key].nodeCount = 0;
    }
    this.maxRelease = 0;
};

Synth.prototype.registerModule = function(name, setModule, type){
    //moduleManagerにモジュールを登録する
    this.moduleManager[name] = new Module(setModule);
    this.moduleManager[name].type = type;
}

Synth.prototype.registerAudioNode = function(currentRecipeNode, module, audioNode){
    //モジュールにAudioNodeを登録
    currentRecipeNode['id'] = module.nodeCount;
    module.nodeList[currentRecipeNode['id']] = audioNode;
    module.nodeCount += 1;

    //レシピにparamが設定されていればparamListに追加
    if (currentRecipeNode['param'] != undefined){
        module.paramList[currentRecipeNode['id']] = currentRecipeNode['param'];
    }

    //AudioNodeを返す
    return module.nodeList[currentRecipeNode['id']];
};

Synth.prototype.noteNoTofreq = function (noteNo){
    //note番号を周波数に変換
    //9番がA(440Hz)
    return 440.0 * Math.pow(2.0, (noteNo - 9.0) / 12.0);
};

Synth.prototype.setSynth = function(currentRecipeNode, destNode) {
    //レシピをもとにAudioNode作成し、destNodeにつないでいく
    var module = this.moduleManager[currentRecipeNode['name']];
    module.setModule(this, currentRecipeNode, destNode, module);
}

Synth.prototype.EnvOn = function(vca, param, time) {
    //音の鳴り始めのエンベーロープ処理
    var attack = param['attack'];
    var decay = param['decay'];
    var sustain = param['sustain'];
    var gain = param['gain'];
    this.noteOnTime = time;

    //attackとdecayが0だとノイズが出るので調整
    attack = attack || 0.001;
    decay = decay || 0.001;

    vca.gain.cancelScheduledValues(time);  // スケジュールを全て解除
    vca.gain.setValueAtTime(0.0, time);  // 今時点を音の出始めとする
    vca.gain.linearRampToValueAtTime(gain, time + attack);
    // ▲ gainまでattackかけて直線的に変化
    vca.gain.linearRampToValueAtTime(sustain * gain, time + attack + decay);
    // ▲ sustain * gainまでattack+decayかけて直線的に変化

    return ;
};
Synth.prototype.EnvOff = function(vca, param, time) {
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

Synth.prototype.noteOn = function(noteNo, time) {
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
            for (var i=0; i<moduleManager[key].nodeCount; i++){
                this.EnvOn(moduleManager[key].nodeList[i], moduleManager[key].paramList[i], time);
            }
        }
    }
};

Synth.prototype.noteOff = function(time){
    //音の鳴り終わりの処理
    var now = this.ctx.currentTime;
    var moduleManager = this.moduleManager;

    //時間が指定されていなければすぐならす
    time = time || now;

    //Envが指定してあるモジュールについてエンベロープ処理を実行
    for (key in moduleManager){
        if (moduleManager[key].type == 'Env'){
            //vcaのreleaseに合わせて音量を0にする
            for (var i=0; i<this.moduleManager['Env'].nodeCount; i++){
                this.EnvOff(moduleManager[key].nodeList[i], moduleManager[key].paramList[i], time);
            }
        }
    }

};

////////////////////////
//モジュールの設定
////////////////////////

//ミキサーを設定
Synth.prototype.setMixer = function(synth, currentRecipeNode, destNode, module) {

    var input = currentRecipeNode['input'];
    //Mixerに接続されるノードの設定が終わっていなければ設定する
    for (var i = 0; i < input.length; i++) {
        synth.setSynth(input[i], destNode);
    }
    //ここまでくればinputの設定が終わっているのでdestNodeに接続
    for (var i = 0; i < input.length; i++) {
        var module = synth.moduleManager[input[i]['name']];
        module.nodeList[input[i]['id']].connect(destNode);
    }
    currentRecipeNode['status'] = true;
    return ;
};

Synth.prototype.setVCO = function(synth, currentRecipeNode, destNode, module) {

    var vco = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createOscillator());
    var param = currentRecipeNode['param'];
    var octave = 1;

    //オシレータの周波数に関する設定
    //frequencyがcvの時は外部入力の周波数を設定
    if (param['frequency'] == 'cv'){
        if(param['octave'] != undefined){
            octave =param['octave'];
        }
        vco.frequency.value = synth.freq * octave;
        synth.cvList.push(vco);
    //frequencyにレシピノードが設定されていればそのレシピノードをfrequencyにつなぐ
    }else if(param['frequency']['name'] != undefined){
        var paramNode = param['frequency'];
        synth.setSynth(paramNode, vco.frequency);

    //それ以外は数値とみなして代入
    }else{
        vco.frequency.value = param['frequency'];
    }
    //オシレータのデチューンを設定
    //detuneにレシピノードが設定されていればそのレシピノードをdetuneにつなぐ
    if(param['detune'] != undefined){
        if(param['detune']['name'] != undefined){
            var paramNode = param['detune'];
            synth.setSynth(paramNode, vco.detune);

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

Synth.prototype.setEnv = function(synth, currentRecipeNode, destNode, module) {

    var env = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createGain());

    //音を止める時に十分な時間を確保するためにreleaseの最大値を記録
    if (currentRecipeNode['param']['release'] > synth.maxRelease){
        synth.maxRelease = currentRecipeNode['param']['release'];
    }
    var input = currentRecipeNode['input'];

    //Envに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, env);
    }
    //EnvノードをdestNodeに接続
    env.gain.value = 0.0;
    env.connect(destNode);
    currentRecipeNode['state'] = true;
};

Synth.prototype.setVCA = function(synth, currentRecipeNode, destNode, module) {

    var vca = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createGain());

    vca.gain.value = currentRecipeNode['gain'];
    var input = currentRecipeNode['input'];

    //VCAに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, vca);
    }
    //VCAノードをdestNodeに接続
    vca.connect(destNode);
    currentRecipeNode['state'] = true;
};

Synth.prototype.setVCF = function(synth, currentRecipeNode, destNode, module) {

    var freq = synth.freq;

    var param = currentRecipeNode['param'];
    var vcf = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createBiquadFilter());

    if (param['frequency'] == 'cv'){
        vcf.frequency.value = freq;
        synth.cvList.push(vcf);
    //frequencyにオブジェクトが設定されていればそのオブジェクトをfrequencyにつなぐ
    }else if(param['frequency']['name'] != undefined){
        var paramNode = param['frequency'];
        synth.setSynth(paramNode, vcf.frequency);

    //それ以外は数値とみなして代入
    }else{
        vcf.frequency.value = param['frequency'];
    }

    if(param['detune'] != undefined){
        if(param['detune']['name'] != undefined){
            var paramNode = param['detune'];
            synth.setSynth(paramNode, vcf.detune);
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
        synth.setSynth(input, vcf);
    }
    //VCFノードをdestNodeに接続
    vcf.connect(destNode);
    currentRecipeNode['state'] = true;
};

Synth.prototype.setNoise = function(synth, currentRecipeNode, destNode, module) {
    var bufsize = 1024;
    var noise = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createScriptProcessor(bufsize));
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

Synth.prototype.setDelay = function(synth, currentRecipeNode, destNode, module) {
    var delay = synth.registerAudioNode(currentRecipeNode, module, synth.ctx.createDelay());
    var input = currentRecipeNode['input'];
    var param = currentRecipeNode['param'];

    var feedback = synth.ctx.createGain();
    var wetlevel = synth.ctx.createGain();
    var drylevel = synth.ctx.createGain();

    //Delayに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, delay);
    }

    if(param['delayTime'] != undefined){
        if(param['delayTime']['name'] != undefined){
            var paramNode = param['delayTime'];
            synth.setSynth(paramNode, delay.delayTime);
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
    var inputModule = synth.moduleManager[input['name']];
    var inputAudioNode = inputModule.nodeList[input['id']];
    inputAudioNode.connect(drylevel);
    wetlevel.connect(destNode);
    drylevel.connect(destNode);
    currentRecipeNode['state'] = true;
};
