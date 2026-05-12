---
title: Django、Scrapy 项目集成(二)
date: 2020-12-29 19:37:12
tag:
  - python
---
新增抓取站点, 设置 django cache, 断点续爬。

<!--more-->

## 目录

- [scrapy](#scrapy)
- [backend](#backend)
- [crawlend](#crawlend)
- [运行](#运行)
- [cache](#cache)
- [断点续爬](#断点续爬)


## scrapy

```sh
cd crawlend
scrapy genspider weibo weibo.com
```

## backend

- 新增 model class

```py
class Weibo(models.Model):
    """
    weibo表
    """

    def __str__(self):
        return "%s"%(self.title)

    uid = models.CharField('唯一ID', max_length=20, unique=True, db_index=True)
    title = models.CharField('标题', max_length=190)
    date = models.CharField('时间', max_length=20)
```

- 在 admin.py 中按已有示例 `register weibo`

## crawlend

- 修改 items.py 和 spiders/douban.py 的内容，重命名 `CrawlendItem` 为 `DoubanItem`
- items.py 中新增 `WeiboItem`

```py
class WeiboItem(scrapy.Item):
    uid = scrapy.Field()
    title = scrapy.Field()
    date = scrapy.Field()
    pass
```

- 在 spiders/douban.py 中指定 PIPELINE

```py
class DoubanSpider(scrapy.Spider):
    name = 'douban'
    custom_settings = {
        'ITEM_PIPELINES':{'crawlend.pipelines.DoubanDBPipeline': 300},
    }
    ...
```

- 修改 spiders/weibo.py

```py
class WeiboSpider(scrapy.Spider):
    name = 'weibo'
    # allowed_domains = ['weibo.com']
    # start_urls = ['http://weibo.com/']
    # 指定 PIPELINES
    custom_settings = {
        'ITEM_PIPELINES':{'crawlend.pipelines.WeiboDBPipeline': 400},
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        'Origin': 'https://s.weibo.com',
        'Host': 's.weibo.com',
        'Referer': 'https://s.weibo.com'
    }

    def start_requests(self):
        start_url = 'https://s.weibo.com/top/summary?cate=realtimehot'
        logging.warn('ready to fetch: ' + start_url)
        yield scrapy.Request(url=start_url, headers=self.headers, callback=self.parse)

    def parse(self, response):
        item = WeiboItem()
        item['uid'] = 'test'
        item['title'] = 'test'
        item['date'] = '2020-12-31'

        yield item

        pass
```

- 修改 pipelines.py 和 setting.py 的内容，重命名 `InsertDBPipeline` 为 `DoubanDBPipeline`
- 新增 pipelines

```py
class WeiboDBPipeline(object):
    def process_item(self, item, spider):
        try:
            weibo = Weibo(uid=item['uid'], title=item['title'], date=item['date'])

            logging.warning('starting save... ' + item['uid'])
            weibo.save()
        # 插入错误
        except django.db.utils.IntegrityError:
            # repeat item
            logging.warning('Exist repeat item! ' + item['uid'])

            state.duplicate_count += 1

        except Exception as e:
            traceback.print_exc()
            sys.exit(1)
    pass
```

- 修改 setting.py 的 ITEM_PIPELINES

把 setting 中 pipeline **去掉**，只保留 spider `custom_settings` 中的 pipeline

```py
ITEM_PIPELINES = {
   'crawlend.pipelines.CrawlendPipeline': 200,
}
```

## 运行

```sh
# root path
python manage.py makemigrations
python manage.py migrate
cd crawlend
scrapy crawl weibo
```

## cache

- 修改 $project/setting.py

```py
redis_url = 'redis://' + str(env('REDIS_HOST')) + ':' + str(env('REDIS_PORT')) + '/' + str(env('REDIS_DB'))
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": redis_url,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

## 断点续爬

- 修改 models.py

```py
class CrawlState(models.Model):
    """
    抓取状态表
    """

    def __str__(self):
        return "%s"%(self.crawler_name)

    uid = models.CharField('唯一ID', max_length=20, unique=True, db_index=True)
    crawler_name = models.CharField('爬虫名', max_length=190)
    current_page = models.CharField('页码', max_length=20, null=True)
```

- 修改 crawlend/pipelines.py

```py
def process_item(self, item, spider):
    # ...
    weibo.save()
    CrawerHelper().save_current_page_to_db('weibo', '微博', item['date'])
```

- 修改 crawlend/spiders/weibo.py

```py
def start_requests(self):
    # 获取当前页码
    page = CrawerHelper().get_current_page_from_db('weibo')
    # 组装 url ...
```
