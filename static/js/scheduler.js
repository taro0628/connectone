function nextNote() {

    var secondsPerBeat = 60.0 / tempo;    // 1拍が何秒かを計算

    nextNoteTime += 0.25 * secondsPerBeat;    // 次の拍が鳴る時間を加算

    current16thNote++;    // 次の拍へ
    if (current16thNote == 16) {
        current16thNote = 0;
        if(currentObj.connect != undefined){
            var random = Math.floor(Math.random() * currentObj.connect.length);
            currentObj = currentObj.connect[random];
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

        var objScore = currentObj.score;
        var objQueue = currentObj.notesInQueue;
        var objRecipe = currentObj.recipe;

        if (objScore[beatNumber] != 0){
            objQueue.push( { note: beatNumber, time: time } );
            var synth = new Synth(ctx, objRecipe);
            synth.noteOn(objScore[beatNumber], time);
            synth.noteOff(time + noteLength);
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
