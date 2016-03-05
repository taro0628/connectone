var startTime;              // 開始時刻
var current16thNote = 0;        // 1小節のうち何番目の音か（1小節に最大16個）
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var tempo = 30.0;          // テンポ(BPM)
var lookahead = 25.0;       // JSのタイマーが呼ばれる間隔(㎳)
var scheduleAheadTime = 0.1;    // スケジューラが先読みする長さ(s)
var nextNoteTime = 0.0;     // 次の音がなるタイミング
var noteResolution = 1;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // 音の長さ(in seconds)

function nextNote() {

    var secondsPerBeat = 60.0 / tempo;    // 1拍が何秒かを計算

    nextNoteTime += 0.25 * secondsPerBeat;    // 次の拍が鳴る時間を加算

    current16thNote++;    // 次の拍へ
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( beatNumber, time ) {
    if ( (noteResolution==1) && (beatNumber%2))
        return; // 1拍が8分なら半分は音を鳴らさない
    if ( (noteResolution==2) && (beatNumber%4))
        return; // 1拍が4分なら4分の1は音を鳴らさない

    //何かノードがないとcurrenttimeが進まないのでダミーのオシレータを作成
    if (ctx.currentTime == 0){
        var dummy = ctx.createOscillator();
    }
    var synthQueue = [];
    if(currentObj != undefined){
        //オブジェクトのアニメーション用にキューに登録
        var objScore = currentObj.score;
        if (objScore[beatNumber] != 0){
            currentObj.notesInQueue.push( { note: beatNumber, time: time } );
        }

        //ここから音を出す処理
        var _time;
        for (var i = 0; i < currentObj.textList.length; i++) {
            var txt = currentObj.textList[i];
            var txtQueue = txt.notesInQueue;
            var txtRecipe = txt.recipe;//音色
            for (var j = 0; j < txt.connectedObjs.length; j++) {
                var obj = txt.connectedObjs[j];
                var score = obj.score;
                if (score[beatNumber] != 0){
                    //距離によってタイミングを変更
                    var _x = txt.x - obj.x;
                    var _y = txt.y - obj.y;
                    var dist = Math.sqrt(_x * _x + _y * _y);
                    _time = time + dist/1000;
                    txtQueue.push( { note: beatNumber, time: _time } );

                    //上書きしてしまわないように音源はキューで管理
                    if(synthQueue.length>10){
                        synthQueue.splice(0,1);
                    }
                    synthQueue.push(new Synth(ctx, txtRecipe));
                    synthQueue[synthQueue.length-1].noteOn(txt.pitch, _time);
                    synthQueue[synthQueue.length-1].noteOff(_time + noteLength);
                }
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
