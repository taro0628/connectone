var stage;
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var backColor = '#0E0E0E';
var objectList = [];
var lineList = [];
var notesInQueue = [];      // スケジューリングされた音{note, time}
var currentObj = undefined;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
