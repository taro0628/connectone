# -*- coding: utf-8 -*-
from bottle import route, run, template, request, static_file, url, get, post, response, error
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
    return template('index')

@route("/static/<filepath:path>", name="static_file")
def static(filepath):
    return static_file(filepath, root="./static")

@route('/tweet/words')
def hello():
    auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)
    result = t.users.show(screen_name = 'taro0628')
    result = t.statuses.user_timeline(screen_name = 'taro0628', count = 10)
    print(result[0]['text'])

    return result[0]['text']


run(host="localhost", port=8001, debug=True, reloader=True)
