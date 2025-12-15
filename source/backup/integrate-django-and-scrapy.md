---
title: Django、Scrapy 项目集成
date: 2020-12-29 19:37:12
tag:
  - python
---
记录 Django、Scrapy 整合教程。

<!--more-->

## 目录

- [Requirements](#Requirements)
- [准备数据库](#准备数据库)
- [创建项目](#创建项目)
- [修改默认代码](#修改默认代码)
- [测试服务](#测试服务)
- [修改model](#修改model)
- [修改crawlend](#修改crawlend)
- [测试运行scrapy](#测试运行scrapy)
- [修改admin](#修改admin)

## Requirements

- Django 3.1.4
- Scrapy 2.4.1
- MySQL 5.6+

## 创建项目

```sh
# 安装cli
pipx install Django==3.1.4 -i https://mirrors.aliyun.com/pypi/simple/
django-admin startproject $myproject
cd $myproject
# 创建指定版本的虚拟环境
pipenv --python 3.6.9
vim Pipfile
# 修改 source - url: https://mirrors.aliyun.com/pypi/simple
pipenv install django==3.1.4
# 进入(已安装django的)虚拟环境
pipenv shell

python manage.py startapp backend

# 退出虚拟环境
exit

## 安装scrapy (请确保 pipx list 中没有 scrapy)
pipenv install scrapy==2.4.1 -i https://mirrors.aliyun.com/pypi/simple/
scrapy startproject crawlend
cd crawlend
scrapy genspider douban douban.com
```

为了方便部署，我们把 `scrapy.cfg` 以及同级的 `crawlend` 目录移动到根目录来!(最外层的 crawlend 不要了)

目录结构可以参考[这篇文章](https://www.cnblogs.com/zx576/p/7295424.html)

## 准备数据库

```sh
# 如果已有 mysql 目录
rm -rf ./mysql/
```

docker-compose.yml

```yml
version: '3.3'
services:
  mysql:
    image: mysql:5.6
    volumes:
      - ./mysql:/var/lib/mysql
    restart: always
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: some_django_app
    command: ['--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci', '--default-authentication-plugin=mysql_native_password']
    container_name: djapp-mysql

  redis:
    image: redis:latest
    restart: always
    ports:
      - '6379:6379'
    container_name: djapp-redis

  phpadmin:
    links:
      - "mysql:db"
    image: phpmyadmin/phpmyadmin:latest
    restart: 'no'
    ports:
      - '8080:80'
    container_name: phpadmin
```

## 修改默认代码

- 安装数据库、环境变量依赖

```sh
pipenv install django-environ pymysql
```

- 修改 $myproject/setting.py

```py
INSTALLED_APPS = [
    'backend',
    ...
]

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('MYSQL_DBNAME'),
        'USER': env('MYSQL_USER'),
        'PASSWORD': env('MYSQL_PASSWORD'),
        'HOST': env('MYSQL_HOST'),
        'PORT': env('MYSQL_PORT'),
        'OPTIONS': {
            'autocommit': True,
            # 'charset': 'utf8mb4',
        },
    }
}

LANGUAGE_CODE = 'zh-hans'

TIME_ZONE = 'Asia/Shanghai'

USE_TZ = False
```

- 修改路由 $myproject/urls.py

```py
...
from django.urls import path, include

# backend 即你的 app name
urlpatterns = [
    path('admin/', admin.site.urls),
    path('main/', include(('backend.urls', 'backend'), namespace='backend')),
]
```

- 新增 backend/urls.py

```py
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'api/', views.api, name='api')
]
```

- 修改 backend/views.py

```py
from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return HttpResponse('hello world')

def api(request):
    return HttpResponse('hello api')
```

## 测试服务

```sh
pipenv shell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

> 如果提示没有数据库 `django_app` 则需先通过 phpmyadmin 创建表。

## 修改model

根据内容需求定义 model，如 [豆瓣电影排行](https://movie.douban.com/chart)

- backend/models.py

```py
from django.db import models

# Create your models here.
class Movie(models.Model):
    """
    电影表
    """

    def __str__(self):
        return "%s"%(self.title)

    uid = models.CharField('唯一ID', max_length=20, unique=True, db_index=True)
    title = models.CharField('标题', max_length=200)
    release = models.CharField('上映时间', max_length=20)
    url = models.CharField('链接', max_length=700)
```

- backend/__init__.py

```py
import pymysql, sys, logging
pymysql.version_info = (1, 4, 2, "final", 0)
pymysql.install_as_MySQLdb()

# check db connection
from django.db import connections
from django.db.utils import OperationalError
db_conn = connections['default']
try:
    c = db_conn.cursor()
except OperationalError:
    logging.error('db connect error!')
    sys.exit(1)
else:
    c.close()
```

修改 model 后需要 migrate

```sh
python manage.py makemigrations
python manage.py migrate
```

## 修改crawlend

- 增加 crawlend/crawlend/state.py 存储状态

```py
duplicate_count = 0
```

- 增加 crawlend/crawlend/helper.py

```py
import os
import sys
import django
import logging
import datetime


def beijing(sec, what):
    beijing_time = datetime.datetime.now() + datetime.timedelta(hours=8)
    return beijing_time.timetuple()


class CrawerHelper(object):

    def init_app(self):
        self.load_django_app()
        logging.Formatter.converter = beijing

    def load_django_app(self):

        BASE_DIR = os.path.dirname(os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))))
        sys.path.append(BASE_DIR)

        # to use "backend"
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djcrawler.settings")
        django.setup()

    # 后期将用到 CrawlState 存储页码
    def get_current_page_from_db(self, uid):
        from backend.models import CrawlState

        try:
            crawlstate = CrawlState.objects.get(uid=uid)
            print(112, crawlstate.current_page)
            return crawlstate.current_page
        except CrawlState.DoesNotExist:
            return ''

    def save_current_page_to_db(self, uid, name, page):
        from backend.models import CrawlState

        crawlstate, created = CrawlState.objects.get_or_create(uid=uid)
        if created:
            # have created a new object
            crawlstate.crawler_name = name
            crawlstate.current_page = page
            crawlstate.save()
        else:
            # update
            crawlstate.current_page = page
            crawlstate.save()
```

- 修改 crawlend/crawlend/settings.py: 在 setting(初始化)中加载django应用、并增加 pipelines

```py
from .helper import CrawerHelper
CrawerHelper().init_app()

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
ROBOTSTXT_OBEY = False
# 时间间隔
DOWNLOAD_DELAY = 5
RANDOMIZE_DOWNLOAD_DELAY = True

ITEM_PIPELINES = {
   'crawlend.pipelines.CrawlendPipeline': 200,
   'crawlend.pipelines.InsertDBPipeline': 300,
}

# LOG_LEVEL = 'WARNING'
```

- 修改 crawlend/crawlend/items.py

```py
import scrapy


class CrawlendItem(scrapy.Item):
    movie_uid = scrapy.Field()
    movie_title = scrapy.Field()
    movie_release = scrapy.Field()
    movie_url = scrapy.Field()
    pass
```

- 修改 crawlend/crawlend/pipelines.py

```py
from itemadapter import ItemAdapter
import sys, django, logging, traceback
from crawlend import state

# after django.setup in setting
from backend.models import *


class CrawlendPipeline:
    def process_item(self, item, spider):
        return item

class InsertDBPipeline(object):
    def process_item(self, item, spider):
        try:
            movie = Movie(uid=item['movie_uid'], title=item['movie_title'], release=item['movie_release'], url=item['movie_url'])

            logging.info('starting save... ' + item['movie_title'])
            movie.save()
        # 插入错误
        except django.db.utils.IntegrityError:
            # repeat item
            logging.warning('Exist repeat item! ' + item['movie_uid'])

            state.duplicate_count += 1

        except Exception as e:
            traceback.print_exc()
            sys.exit(1)
    pass
```

- 修改 crawlend/crawlend/spiders/$site.py

注释掉 `allowed_domains`

```py
class DoubanSpider(scrapy.Spider):
    name = 'douban'
    # allowed_domains = ['douban.com']
    # start_urls = ['http://douban.com/']
    url = 'https://movie.douban.com/chart'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        'Origin': 'https://movie.douban.com',
        'Host': 'movie.douban.com',
        'Referer': 'https://movie.douban.com'
    }

    def start_requests(self):
        start_url = self.url
        logging.warn('ready to get: ' + start_url)
        yield scrapy.Request(url=start_url, headers=self.headers, callback=self.parse)

    def parse(self, response):
        res_list = response.css('.indent table')
        # 如果是 json
        # jsonresponse = json.loads(response.text)

        for record in res_list:
            item = CrawlendItem()
            href = record.css('.pl2 a::attr(href)').get(default='').strip()
            href_splited = list(filter(None, href.split('/')))
            title = record.css('.pl2 a::text').get(default='').strip()

            if title.endswith('/'):
                title = title[:-1].strip()

            item['movie_uid'] = href_splited[-1]
            item['movie_title'] = title
            item['movie_release'] = 'test'
            item['movie_url'] = href

            yield item
```

爬取多页的逻辑：

```py
def parse(self, response):
    # ...
    # ...
    # 重复项 < 10 则继续抓取
    # if state.duplicate_count < 10
    # 页数小于最后一页则继续抓取
    if self.current_page < self.last_page:
        self.current_page = self.current_page + 1
        next_page = self.url + str(self.current_page)
        logging.warning('ready to fetch: ' + next_page)
        yield scrapy.Request(url=next_page, headers=self.headers, callback=self.parse)
```

## 测试运行scrapy

```sh
# 进入到 scrapy.cfg 所在目录
cd crawlend
scrapy list
scrapy crawl douban
```

## 修改admin

- backend/admin.py

```py
from django.contrib import admin
from .models import Movie

# Register your models here.
class MovieAdmin(admin.ModelAdmin):

    '''设置列表可显示的字段'''
    list_display = ('uid', 'title', 'release', 'url')

    '''设置过滤选项'''
    list_filter = ('release',)

    '''每页显示条目数'''
    list_per_page = 5

    '''设置可编辑字段'''
    list_editable = ('title',)

    # '''按日期月份筛选'''
    # date_hierarchy = 'pub_date'

    # '''按发布日期排序'''
    # ordering = ('-mod_date',)

admin.site.register(Movie, MovieAdmin)
```
