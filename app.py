# -*- coding: utf-8 -*-
from bottle import route, run, template, request, static_file, url, get, post, response, error, HTTPResponse, default_app
import json
from twitter import *
import time
import MeCab
from collections import defaultdict
from io     import BytesIO
from PIL    import Image
import requests
import random
from rauth import OAuth1Service
from beaker.middleware import SessionMiddleware
from urllib.parse import parse_qsl
from requests_oauthlib import OAuth1Session

with open("secret.json") as f:
    secretjson = json.load(f)


t = 0
twitter_stream = ''
twitter_stream_user = ''

session_opts = {
    'session.type': 'file',
    'session.data_dir': './data',
    'session.cookie_expires': True,
    'session.auto': True
}

@route('/')
def root():
    return template('index')

@route('/oauth/request')
def oauth_request():
    request_token_url = 'https://api.twitter.com/oauth/request_token'

    client_key = secretjson['consumer_key']
    client_secret = secretjson['consumer_secret']

    oauth = OAuth1Session(client_key, client_secret=client_secret)
    fetch_response = oauth.fetch_request_token(request_token_url)

    #リクエストトークンを取得
    request_token = fetch_response.get('oauth_token')
    request_token_secret = fetch_response.get('oauth_token_secret')

    #リクエストトークンシークレットをセッションに保存
    session = request.environ.get('beaker.session')
    session['request_token'] = request_token
    session['request_token_secret'] = request_token_secret
    session.save()

    #認証用のURLを返す
    base_authorization_url = 'https://api.twitter.com/oauth/authorize'
    authorization_url = oauth.authorization_url(base_authorization_url)

    return authorization_url

@route('/oauth/access')
def oauth_access():
    access_token_url = 'https://api.twitter.com/oauth/access_token'
    client_key = secretjson['consumer_key']
    client_secret = secretjson['consumer_secret']

    oauth_token = request.query.oauth_token
    oauth_verifier = request.query.oauth_verifier

    session = request.environ.get('beaker.session')
    request_token = session.get('request_token', '')
    request_token_secret = session.get('request_token_secret', '')

    oauth = OAuth1Session(client_key,
                          client_secret=client_secret,
                          resource_owner_key=oauth_token,
                          resource_owner_secret=request_token_secret,
                          verifier=oauth_verifier)

    oauth_tokens = oauth.fetch_access_token(access_token_url)

    #アクセストークンを取得
    access_token = oauth_tokens.get('oauth_token')
    access_token_secret = oauth_tokens.get('oauth_token_secret')
    user_id = oauth_tokens.get('user_id')
    screen_name = oauth_tokens.get('screen_name')

    #セッションに保存
    session['access_token'] = access_token
    session['access_token_secret'] = access_token_secret
    session['screen_name'] = screen_name
    session.save()

    r = HTTPResponse(status=302)
    r.set_header('Location', 'http://k-taro.xyz/')

    return r

#静的ファイルの設定
#本番ではhttpサーバが担当
@route("/static/<filepath:path>", name="static_file")
def static(filepath):
    return static_file(filepath, root="./static")


#スクリーンネームからアイコン画像を取得
@route('/user/icon/<screen_name>')
def getIcon(screen_name):
    #ツイッターAPIの準備
    session = request.environ.get('beaker.session')
    access_token = session.get('access_token', '')
    access_token_secret = session.get('access_token_secret', '')

    auth = OAuth(access_token, access_token_secret, secretjson["consumer_key"], secretjson["consumer_secret"])
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
    session = request.environ.get('beaker.session')
    access_token = session.get('access_token', '')
    access_token_secret = session.get('access_token_secret', '')
    auth = OAuth(access_token, access_token_secret, secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)

    #テキストがnoneだったらログインユーザを返す
    if text == 'none':
        session = request.environ.get('beaker.session')
        screen_name = session.get('screen_name')
        user = t.users.show(screen_name = screen_name)
        return user

    #テキストで検索
    result = t.search.tweets(q = text, lang = 'ja', count = 100)
    rand = random.randint(0, 99)
    screen_name = result['statuses'][rand]['user']['screen_name']
    user = result['statuses'][rand]['user']

    return user

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

#スクリーンネームで指定したユーザの頻出単語を取得
@route('/tweet/words/<screen_name>')
def getTweet(screen_name):

    mecab = MeCab.Tagger ('-d /usr/lib64/mecab/dic/mecab-ipadic-neologd')

    #ツイッターAPIの準備
    session = request.environ.get('beaker.session')
    access_token = session.get('access_token', '')
    access_token_secret = session.get('access_token_secret', '')
    auth = OAuth(access_token, access_token_secret, secretjson["consumer_key"], secretjson["consumer_secret"])
    t = Twitter(auth = auth)

    #ツイートを取得
    timeline = t.statuses.user_timeline(screen_name = screen_name, count = 200)
    word2freq = defaultdict(int)
    for tweet in timeline:
        # 形態素解析
        text = filter(tweet['text'])
        mecab.parse('')
        node = mecab.parseToNode(text)
        while node:
            #print('{0}, {1}'.format(node.surface, node.feature))
            word = node.surface
            pos = node.feature.split(",")[1]
            #print(pos)
            if pos == "固有名詞" and len(word) != 1:
                word2freq[word] += 1
            node = node.next
    sorted_word2freq = sorted(word2freq.items(), key=lambda x:x[1], reverse=True)
    resultList = []
    for item in sorted_word2freq:
        resultList.append(item[0])

    #結果はJSON形式で返す
    return json.dumps(resultList, ensure_ascii=False)


#run(host="localhost", port=8001, debug=True, reloader=True)
application = default_app()
application = SessionMiddleware(application, session_opts)
