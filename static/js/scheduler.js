var startTime;              // 開始時刻
var current16thNote = 0;        // 1小節のうち何番目の音か（1小節に最大16個）
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var tempo = 60.0;          // テンポ(BPM)
var lookahead = 25.0;       // JSのタイマーが呼ばれる間隔(㎳)
var scheduleAheadTime = 0.1;    // スケジューラが先読みする長さ(s)
var nextNoteTime = 0.0;     // 次の音がなるタイミング
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.1;      // 音の長さ(in seconds)
var currentSeqNum = 0;

function nextNote() {

    var secondsPerBeat = 60.0 / tempo;    // 1拍が何秒かを計算

    nextNoteTime += 0.25 * secondsPerBeat;    // 次の拍が鳴る時間を加算

    current16thNote++;    // 次の拍へ
    if (current16thNote == 16) {
        current16thNote = 0;
        if(sequencerList.length != 0){
            currentSeqNum++;
        }
        if (currentSeqNum >= sequencerList.length) {
            currentSeqNum = 0;
        }
        currentSeq = sequencerList[currentSeqNum];
    }
}

function scheduleNote( beatNumber, time ) {
    if ( (noteResolution==1) && (beatNumber%2))
        return; // 1拍が8分なら半分は音を鳴らさない
    if ( (noteResolution==2) && (beatNumber%4))
        return; // 1拍が4分なら4分の1は音を鳴らさない

    //何かノードがないとcurrenttimeが進まないのでダミーのオシレータを作成
    if (ctx.currentTime == 0){
        //var dummy = ctx.createOscillator();
    }
    if (currentSeq == undefined){
        return;
    }
    //オブジェクトのアニメーション用にキューに登録
    var seqScore = currentSeq.score;
    if (seqScore[beatNumber] != 0){
        currentSeq.notesInQueue.push( { note: beatNumber, time: time } );
    }

    //ここから音を出す処理
    var _time;
    for (var j = 0; j < currentSeq.connectedTone.length; j++) {
        var tone = currentSeq.connectedTone[j];
        var toneQueue = tone.notesInQueue;
        var toneRecipe = tone.recipe;//音色
        var toneScore = tone.score;
        var seq = currentSeq;
        var score = seq.score;
        if (score[beatNumber] != 0 && toneScore[beatNumber] != 0){
            //距離によってタイミングを変更
            var _x = tone.x - seq.x;
            var _y = tone.y - seq.y;
            var dist = Math.sqrt(_x * _x + _y * _y);
            _time = time + dist/1000;
            if(toneQueue.time != _time){
                toneQueue.push( { note: beatNumber, time: _time } );
                //var synth = new Synth(ctx, toneRecipe);
                tone.synth.noteOn(toneScore[beatNumber], _time);
                tone.synth.noteOff(_time + noteLength);
                console.log(currentSeq)
            }
        }
    }
}

function scheduler() {
    //先読みしている時間内に設定できる音をすべて設定する
    while (nextNoteTime < ctx.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
}

var timerId = setInterval(function(){
    scheduler();
}, lookahead)
