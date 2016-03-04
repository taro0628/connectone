from twitter import *
import json

# OAuth2.0用のキーを取得する
with open("secret.json") as f:
    secretjson = json.load(f)

auth = OAuth(secretjson["access_token"], secretjson["access_token_secret"], secretjson["consumer_key"], secretjson["consumer_secret"])
twitter_stream = TwitterStream(auth=auth, domain="stream.twitter.com")

for msg in twitter_stream.statuses.filter(follow = '1607460769'):
    print('test')
    if 'text' in msg:
        print (msg['text'])
