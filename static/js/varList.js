var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';
var objectList = [];
var lineList = [];

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
var startTime;              // 開始時刻
var current16thNote = 0;        // 1小節のうち何番目の音か（1小節に最大16個）
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var tempo = 60.0;          // テンポ(BPM)
var lookahead = 25.0;       // JSのタイマーが呼ばれる間隔(㎳)
var scheduleAheadTime = 0.1;    // スケジューラが先読みする長さ(s)
var nextNoteTime = 0.0;     // 次の音がなるタイミング
var noteResolution = 1;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // 音の長さ(in seconds)
var notesInQueue = [];      // スケジューリングされた音{note, time}
var currentObj = undefined;
var lineListManager = [];
