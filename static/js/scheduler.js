var startTime;              // 開始時刻
var current16thNote = 0;        // 1小節のうち何番目の音か（1小節に最大16個）
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var tempo = 60.0;          // テンポ(BPM)
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
        if(currentObj != undefined){
            if(currentObj.nextObjs.length != 0){
                var random = Math.floor(Math.random() * currentObj.nextObjs.length);
                currentObj = currentObj.nextObjs[random];
            }
        }
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
    if(currentObj != undefined){

        for (var i = 0; i < currentObj.textList.length; i++) {
            var textScore = currentObj.textList[i].score;
            var textQueue = currentObj.textList[i].notesInQueue;
            var textRecipe = currentObj.textList[i].recipe;
            if (textScore[beatNumber] != 0){
                textQueue.push( { note: beatNumber, time: time } );
                var synth = new Synth(ctx, textRecipe);
                synth.noteOn(textScore[beatNumber], time);
                synth.noteOff(time + noteLength);
            }
        }

    }

}

function scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTime < ctx.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
}

var timerId = setInterval(function(){
    scheduler();
}, lookahead)
