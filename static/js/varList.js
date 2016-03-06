var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';
var sequencerList = [];
var lineList = [];

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
