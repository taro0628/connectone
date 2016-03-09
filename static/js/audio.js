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
    this.cvList = [];

    this.addNode('Mixer', this.setMixer);
    this.addNode('VCO', this.setVCO, 'VCO');
    this.addNode('Env', this.setEnv, 'Env');
    this.addNode('VCA', this.setVCA);
    this.addNode('VCF', this.setVCF);
    this.addNode('Noise', this.setNoise);
    this.addNode('Delay', this.setDelay);

    this.initSynth();
    this.setSynth(JSON.parse(JSON.stringify(this.recipe)), this.ctx.destination);
    for (key in this.nodeManager){
        if (this.nodeManager[key].type == 'VCO'){
            for (var i=0; i<this.nodeManager[key].currentId; i++){
                this.nodeManager[key].nodeList[i].start(0);
            }
        }
    }
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

    var input = currentNode['input'];
    //Mixerに接続されるノードの設定が終わっていなければ設定する
    for (var i = 0; i < input.length; i++) {
        synth.setSynth(input[i], destNode);
    }
    //ここまでくればinputの設定が終わっているのでdestNodeに接続
    for (var i = 0; i < input.length; i++) {
        synth.nodeManager[input[i]['name']].nodeList[input[i]['id']].connect(destNode);
    }
    currentNode['status'] = true;
    return ;
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
        synth.cvList.push(vco);
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
    env.gain.value = 0.0;
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

    var input = currentNode['input'];

    //VCFに接続されるノードの設定が終わっていなければ設定する
    if (input['state'] == undefined){
        synth.setSynth(input, vcf);
    }
    //VCFノードをdestNodeに接続
    vcf.connect(destNode);
    currentNode['state'] = true;
};

Synth.prototype.setNoise = function(synth, currentNode, destNode, node) {
    var bufsize = 1024;
    var noise = synth.createNode(currentNode, node, synth.ctx.createScriptProcessor(bufsize));
    noise.onaudioprocess = function(ev){
        var buf0 = ev.outputBuffer.getChannelData(0);
        var buf1 = ev.outputBuffer.getChannelData(1);
        for(var i = 0; i < bufsize; ++i)
            buf0[i] = buf1[i] = (Math.random() - 0.5);
    };

    //Noiseノードの設定が終わったのでdestNodeに接続
    noise.connect(destNode);
    currentNode['state'] = true;
};

Synth.prototype.setDelay = function(synth, currentNode, destNode, node) {
    var delay = synth.createNode(currentNode, node, synth.ctx.createDelay());
    var input = currentNode['input'];
    var param = currentNode['param'];

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
    var inputNode = synth.nodeManager[input['name']];
    inputNode.nodeList[inputNode.currentId-1].connect(drylevel);
    wetlevel.connect(destNode);
    drylevel.connect(destNode);
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

    var now = this.ctx.currentTime;
    var nodeManager = this.nodeManager;

    time = time || now;

    this.freq = this.noteNoTofreq(noteNo);

    for (var i = 0; i < this.cvList.length; i++) {
        this.cvList[i].frequency.value = this.freq;
    }
    for (key in nodeManager){
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
        if (nodeManager[key].type == 'Env'){
            //vcaのreleaseに合わせて音量を0にする
            for (var i=0; i<this.nodeManager['Env'].currentId; i++){
                this.EnvOff(nodeManager[key].nodeList[i], nodeManager[key].paramList[i], time);
            }
        }
    }

};
