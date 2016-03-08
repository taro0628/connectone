var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';
var sequencerList = [];
var lineList = [];
var loadingIcon;
var currentSeq;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
