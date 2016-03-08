# -*- coding: utf-8 -*-
from bottle import route, run, template, request, static_file, url, get, post, response, error, HTTPResponse
import json
from twitter import *
import time
import MeCab
from collections import defaultdict
from io     import BytesIO
from PIL    import Image
import requests
import random

with open("secret.json") as f:
    secretjson = json.load(f)


t = 0
twitter_stream = ''
twitter_stream_user = ''

@route('/')
def root():
    return template('index')

#静的ファイルの設定
#本番ではhttpサーバが担当
@route("/static/<filepath:path>", name="static_file")
def static(filepath):
    return static_file(filepath, root="./static")


#スクリーンネームからアイコン画像を取得
@route('/user/icon/<screen_name>')
def getIcon(screen_name):
    #ツイッターAPIの準備
    auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)

    #スクリーンネームでユーザを検索し、アイコンのurlを取得
    result = t.users.show(screen_name = screen_name)
    image_url     = result['profile_image_url']

    # URLから画像を開く
    response      = requests.get(image_url)
    pillow_object = Image.open(BytesIO(response.content))
    
    # HTTPレスポンスを作成する
    output = BytesIO()
    pillow_object.save(output, format='png')
    
    res = HTTPResponse(status=200, body=output.getvalue())
    res.set_header('Content-Type', 'image/png')
    return res

#指定したテキストを含むつぶやきをしたユーザを検索
@route('/user/name/<text>')
def getName(text):
    #ツイッターAPIの準備
    auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)

    result = t.search.tweets(q = text, lang = 'ja', count = 100)
    rand = random.randint(0, 99)
    print(rand)
    screen_name = result['statuses'][rand]['user']['screen_name']

    return screen_name

# ツイート文の余計な部分を削除
def filter(text):
    # "RT @user:"を削除
    if "RT " in text:
        text = text.split(":", 1)[1]
    # "@user"を削除
    if "@" in text and " " in text:
        text = text.split(" ", text.count("@"))[-1]
    # "#tag"を削除
    if "#" in text:
        text = text.split("#", 1)[0]
    # "URL"を削除
    if "http" in text:
        text = text.split("http", 1)[0]
    return text

#スクリーンネームで指定したユーザのつぶやき中の固有名詞を取得
@route('/tweet/words/<screen_name>')
def getTweet(screen_name):
    mecab = MeCab.Tagger ('-d /usr/local/lib/mecab/dic/mecab-ipadic-neologd')

    #ツイッターAPIの準備
    auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)

    #ツイートを取得
    timeline = t.statuses.user_timeline(screen_name = screen_name, count = 200)
    resultList = []
    for tweet in timeline:
        # 形態素解析
        text = filter(tweet['text'])
        mecab.parse('')
        node = mecab.parseToNode(text)
        while node:
            print('{0}, {1}'.format(node.surface, node.feature))
            word = node.surface
            pos = node.feature.split(",")[1]
            if pos == "固有名詞" and len(word) != 1:
                resultList.append(word)
            node = node.next

    #結果はJSON形式で返す
    return json.dumps(resultList, ensure_ascii=False)


run(host="localhost", port=8001, debug=True, reloader=True)
