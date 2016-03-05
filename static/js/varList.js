var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';
var sequencerList = [];
var lineList = [];

var isClick = false;//オブジェクトがクリックされたかのフラグ
var isMoved = false;//オブジェクトが移動したかのフラグ
var moveObj = undefined;//クリックされたオブジェクト

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
