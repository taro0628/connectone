function Node(setNode){
    this.nodeList = new Array(10);
    this.paramList = new Array(10);
    this.currentId = 0;
    this.type = null;
    this.setNode = setNode;
}

function Synth(ctx, recipe){
    this.ctx = ctx;
    this.freq = 0;
    this.nodeManager = {};
    this.recipe = recipe;
    this.addNode('Mixer', this.setMixer);
    this.addNode('VCO', this.setVCO, 'VCO');
    this.addNode('Env', this.setEnv, 'Env');
    this.addNode('VCA', this.setVCA);
    this.addNode('VCF', this.setVCF);

    this.initSynth();
}
Synth.prototype.initSynth = function(){
    for (key in this.nodeManager){
        this.nodeManager[key].currentId = 0;
    }
    this.maxRelease = 0;
};

Synth.prototype.addNode = function(name, setNode, type){
    this.nodeManager[name] = new Node(setNode);
    this.nodeManager[name].type = type;
}

Synth.prototype.createNode = function(currentNode, node, newNode){
    currentNode['id'] = node.currentId;
    node.nodeList[currentNode['id']] = newNode;
    node.currentId += 1;

    if (currentNode['param'] != undefined){
        node.paramList[currentNode['id']] = currentNode['param'];
    }

    return node.nodeList[currentNode['id']];
};

Synth.prototype.noteNoTofreq = function (noteNo){
    //note番号を周波数に変換
    return 440.0 * Math.pow(2.0, (noteNo - 9.0) / 12.0);
};

Synth.prototype.setMixer = function(synth, currentNode, destNode, node) {

    var input1 = currentNode['input1'];
    var input2 = currentNode['input2'];
    //Mixerに接続されるノードの設定が終わっていなければ設定する
    if (input1['state']==undefined){
        synth.setSynth(input1, destNode);
    }
    if (input2['state']==undefined){
        synth.setSynth(input2, destNode);
    }
    //ここまでくればinput1もinput2も設定が終わっているのでdestNodeに接続
    if (input1['state']==true && input2['state']==true){
        synth.nodeManager[input1['name']].nodeList[input1['id']].connect(destNode);
        synth.nodeManager[input2['name']].nodeList[input2['id']].connect(destNode);
        currentNode['status'] = true;
        return ;
    }
};

Synth.prototype.setVCO = function(synth, currentNode, destNode, node) {

    var vco = synth.createNode(currentNode, node, synth.ctx.createOscillator());
    var param = currentNode['param'];
    var octave = 1;

    //オシレータの周波数に関する設定
    //frequencyがcvの時は外部入力の周波数を設定
    if (param['frequency'] == 'cv'){
        if(param['octave'] != undefined){
            octave =param['octave'];
        }
        vco.frequency.value = synth.freq * octave;
    //frequencyにオブジェクトが設定されていればそのオブジェクトをfrequencyにつなぐ
    }else if(param['frequency']['name'] != undefined){
        var paramNode = param['frequency'];
        synth.setSynth(paramNode, vco.frequency);

    //それ以外は数値とみなして代入
    }else{
        vco.frequency.value = param['frequency'];
    }
    //オシレータのデチューンを設定
    //detuneにオブジェクトが設定されていればそのオブジェクトをdetuneにつなぐ
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
    currentNode['state'] = true;
};

Synth.prototype.setEnv = function(synth, currentNode, destNode, node) {

    var env = synth.createNode(currentNode, node, synth.ctx.createGain());

    //envParamList[currentNode['id']] = currentNode['param'];
    //音を止める時に十分な時間を確保するためにreleaseの最大値を記録
    if (currentNode['param']['release'] > synth.maxRelease){
        synth.maxRelease = currentNode['param']['release'];
    }
    var input = currentNode['input'];

    //Envに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, env);
    }
    //EnvノードをdestNodeに接続
    env.gain.value = 0;
    env.connect(destNode);
    currentNode['state'] = true;
};

Synth.prototype.setVCA = function(synth, currentNode, destNode, node) {

    var vca = synth.createNode(currentNode, node, synth.ctx.createGain());

    vca.gain.value = currentNode['gain'];
    var input = currentNode['input'];

    //VCAに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, vca);
    }
    //VCAノードをdestNodeに接続
    vca.connect(destNode);
    currentNode['state'] = true;
};

Synth.prototype.setVCF = function(synth, currentNode, destNode, node) {

    var freq = synth.freq;

    var param = currentNode['param'];
    var vcf = synth.createNode(currentNode, node, synth.ctx.createBiquadFilter());

    if (param['frequency'] == 'cv'){
        vcf.frequency.value = freq;
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

    var input = currentNode['input'];

    //VCFに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, vcf);
    }
    //VCFノードをdestNodeに接続
    vcf.connect(destNode);
    currentNode['state'] = true;
};

Synth.prototype.setSynth = function(currentNode, destNode) {
    var node = this.nodeManager[currentNode['name']];
    node.setNode(this, currentNode, destNode, node);
}

Synth.prototype.EnvOn = function(vca, param, time) {
    var attack = param['attack'];
    var decay = param['decay'];
    var sustain = param['sustain'];
    var gain = param['gain'];

    vca.gain.cancelScheduledValues(0);  // スケジュールを全て解除
    vca.gain.setValueAtTime(0.0, time);  // 今時点を音の出始めとする
    vca.gain.linearRampToValueAtTime(gain, time + attack);
    // ▲ gainまでattackかけて直線的に変化
    vca.gain.linearRampToValueAtTime(sustain * gain, time + attack + decay);
    // ▲ sustain * gainまでattack+decayかけて直線的に変化

    return ;
};
Synth.prototype.EnvOff = function(vca, param, time) {
    var sustain = param['sustain'];
    var gain = param['gain'];
    var release = param['release'];

    // 音が途切れるのを防ぐために設定
    vca.gain.setValueAtTime(sustain * gain, time);
    vca.gain.linearRampToValueAtTime(0, time + release);

    return;
};

Synth.prototype.noteOn = function(noteNo, time) {

    var now = this.ctx.currentTime;
    var nodeManager = this.nodeManager;
    time = time || now;

    this.freq = this.noteNoTofreq(noteNo);
    this.initSynth();
    this.setSynth(JSON.parse(JSON.stringify(this.recipe)), this.ctx.destination);

    for (key in nodeManager){
        if (nodeManager[key].type == 'VCO'){
            for (var i=0; i<nodeManager[key].currentId; i++){
                nodeManager[key].nodeList[i].start(time);
            }
        }
        if (nodeManager[key].type == 'Env'){
            for (var i=0; i<nodeManager[key].currentId; i++){
                this.EnvOn(nodeManager[key].nodeList[i], nodeManager[key].paramList[i], time);
            }
        }
    }
};

Synth.prototype.noteOff = function(time){
    var now = this.ctx.currentTime;
    var nodeManager = this.nodeManager;

    time = time || now;

    for (key in nodeManager){
        if (nodeManager[key].type == 'VCO'){
            //vcaの音量が全て0になってからvcoを止める
            for (var i=0; i<this.nodeManager['VCO'].currentId; i++){
                nodeManager[key].nodeList[i].stop(time + this.maxRelease);
            }
        }
        if (nodeManager[key].type == 'Env'){
            //vcaのreleaseに合わせて音量を0にする
            for (var i=0; i<this.nodeManager['Env'].currentId; i++){
                this.EnvOff(nodeManager[key].nodeList[i], nodeManager[key].paramList[i], time);
            }
        }
    }

};
