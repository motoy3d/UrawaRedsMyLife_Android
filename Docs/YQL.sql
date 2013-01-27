-- yql.query.multi使用。クエリごとにresultsが1階層増えてしまい、まとめてのソートができない
select *
from yql.query.multi where queries in (
"select channel.title,channel.item.title,channel.item.link,channel.item.description,channel.item.encoded,channel.item.pubDate from xml where url in ('http://redsgyakushuu.blog.shinobi.jp/RSS/200/','http://pipes.yahoo.com/pipes/pipe.run?_id=5dbb575b9d1a00d5e65222fd07364e08&_render=rss') "
,"select channel.title,channel.item.title,channel.item.link,channel.item.description,channel.item.encoded,channel.item.pubDate from xml where url in ('http://www.soccer-king.jp/RSS.rdf','http://gazfootball.com/blog/index.xml') and (channel.item.title like '%浦和%') "
)
-- yql.query.multi使用。クエリごとにresultsが1階層増えてしまい、まとめてのソートができない
SELECT * from yql.query.multi(10) where queries="SELECT title, link, description, encoded, pubDate from feed where url in (
'http://blogrss.shinobi.jp/rss/ninja/redsgyakushuu'
,'http://redsnowman.cocolog-nifty.com/urawa_goten/index.rdf'
,'http://feedblog.ameba.jp/rss/ameblo/tsukasa-umesaki/rss20.xml'
,'http://feedblog.ameba.jp/rss/ameblo/yosuke-kashiwagi/rss20.xml');
SELECT title, link, description, encoded, pubDate from feed where url in (
'http://www.soccer-king.jp/RSS.rdf');
"

-- channel階層が増えるとうまくいかず
select channel.title,channel.item.title from xml where url in ('http://redsgyakushuu.blog.shinobi.jp/RSS/200/','http://pipes.yahoo.com/pipes/pipe.run?_id=5dbb575b9d1a00d5e65222fd07364e08&_render=rss') 

select channel.title,channel.item.title,channel.item.link,channel.item.description,channel.item.encoded,channel.item.pubDate from xml where url in ('http://redsgyakushuu.blog.shinobi.jp/RSS/200/','http://pipes.yahoo.com/pipes/pipe.run?_id=5dbb575b9d1a00d5e65222fd07364e08&_render=rss') 

select channel.title,channel.item.title,channel.item.link,channel.item.description,channel.item.encoded,channel.item.pubDate from xml where url in ('http://www.soccer-king.jp/RSS.rdf','http://gazfootball.com/blog/index.xml') and (channel.item.title like '%浦和%') 




■■■■■■■■■■■■■■■■■■■■■■■■■■■■
Google Reader API(非公式)を使用
■■■■■■■■■■■■■■■■■■■■■■■■■■■■
SELECT id.original-id,link.href,title.content,source.title.content,published,summary.content FROM feed WHERE url='http://www.google.com/reader/public/atom/user%2F12632507706320288487%2Flabel%2FUrawaReds?n=40c=xxxxxxxx' and title.content not like 'PR%'
※cパラメータは2回目以降のアクセスで「続きを見る」ために使用
↓
xxxxxxxxには、下記で取得した値をセットする
SELECT continuation FROM xml WHERE url='http://www.google.com/reader/public/atom/user%2F12632507706320288487%2Flabel%2FUrawaReds?n=40'
↓
2回目以降にcontinuationを取得する際は、前回のcontinuationをcパラメータにセットする
SELECT continuation FROM xml WHERE url='http://www.google.com/reader/public/atom/user%2F12632507706320288487%2Flabel%2FUrawaReds?n=40&c=yyyyyyyyy' and title.content not like 'PR%'


サッカージャーナル
SELECT id.original-id,link.href,title.content,source.title.content,published,summary.content FROM feed WHERE url='http://www.google.com/reader/public/atom/user%2F12632507706320288487%2Flabel%2FUrawaReds2'




■■■■■■■■■■■■■■■■■■■■■■■■■■■■
浦和公式サイトの試合日程をスクレイピング
■■■■■■■■■■■■■■■■■■■■■■■■■■■■
select * from html where url="http://www.urawa-reds.co.jp/game/" and xpath="//div[@class='mainContentColumn']/table/tr"

