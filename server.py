# -*- coding: utf-8 -*-
from bottle import route, run, template, request, static_file, url, get, post, response, error
from bottle.ext.websocket import GeventWebSocketServer
from bottle.ext.websocket import websocket
import json
from twitter import *
import time

with open("secret.json") as f:
    secretjson = json.load(f)


t = 0
twitter_stream = ''
twitter_stream_user = ''

@route('/')
def root():
    global t
    global twitter_stream
    global twitter_stream_user
    auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)
    twitter_stream = TwitterStream(auth=auth, domain="stream.twitter.com")
    twitter_stream_user = TwitterStream(auth=auth, domain="userstream.twitter.com")
    return template('index')

@route("/static/<filepath:path>", name="static_file")
def static(filepath):
    return static_file(filepath, root="./static")

@route('/hello')
def hello():
    global t
    serch_str = u'ももクロ'
    apiresults = t.search.tweets(q=serch_str, lang="ja", result_type="recent", count=1)
    print(apiresults['statuses'][0]['text'])
    return apiresults['statuses'][0]['text'].encode('utf-8')

@route('/relation')
def relation():
    global t
    screan_names = []
    friends = t.followers.list()
    for name in friends['users']:
        screan_names.append(name['screen_name'])
    return screan_names

#@get('/websocket', apply=[websocket])
#def echo(ws):
    #global t
    #global twitter_stream
    #global twitter_stream_user
    ##for msg in twitter_stream.statuses.filter(follow = '1607460769,114683495'):
    #for msg in twitter_stream.statuses.filter(track = u'シャープ'):
    ##for msg in twitter_stream_user.user():
        #print('test')
        #if 'text' in msg:
            #ws.send(msg['text'])

run(host="localhost", port=8001, debug=True, reloader=True, server=GeventWebSocketServer)
