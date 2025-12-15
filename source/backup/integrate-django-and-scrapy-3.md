---
title: Django、Scrapy 项目集成(三)
date: 2021-01-04 17:26:02
tag:
  - python
hidden: true
---
使用部署 Django + Scrapy 项目，并配置定时抓取，生成 restful API

<!--more-->

## 目录

- [scrapyd](#scrapyd)
- [定时任务](#定时任务)
- [djangorestframework](#djangorestframework)

## scrapyd

参考 https://www.pythonf.cn/read/98399

启动 Django 容器后通过命令再启动 scrapyd

```sh
docker exec -it app scrapyd > ./scrapyd.log &
```

```sh
# 开始 job
curl http://localhost:6800/schedule.json -d project=default -d spider=douban

# 取消 job
curl http://localhost:6800/cancel.json -d project=default -d job=94bd8ce041fd11e6af1a000c2969bafd
```

## 定时任务

```sh
mkdir /home/shell
vim /home/shell/douban_crawl.sh
chmod +x douban_crawl.sh
crontab -e
```

crawl.sh

```sh
#!/bin/sh
curl http://vir.nicebook.win:16800/schedule.json -d project=default -d spider=weibo
```

cron 每2小时执行

```conf
1 */2 * * * /bin/bash /home/shell/douban_crawl.sh
```

cron 每天2时30分执行

```conf
30 2 * * * /bin/bash /home/backup-sql/autojob.sh
```

## djangorestframework

```sh
pipenv install djangorestframework
```

$project/setting.py

```py
INSTALLED_APPS = [
    ...
    'rest_framework',
    'backend',
]
```

新建 backend/serializers.py

```py
from rest_framework import serializers
from . import models
class DoubanSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('uid', 'title',)
        model = models.Movie
```

修改 views.py

```py
from rest_framework import generics
from . import models
from . import serializers

class DoubanList(generics.ListAPIView):
    queryset = models.Movie.objects.all()
    serializer_class = serializers.DoubanSerializer

    # backend 中加入OrderingFilter SearchFilter 激活ordering filter，字段为ordering
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,)
    ordering_fields = ('uid', 'title')
    # 指定默认的排序字段
    ordering = ('uid',)
    # 指定可搜索字段
    search_fields = ('uid', 'title')
```

修改 urls.py

```py
url(r'api/douban', views.DoubanList.as_view(), name='douban_api'),
```

增加分页，修改 $project/setting.py

```py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10
}
```

通过请求中的 `limit` 和 `offset` 控制分页.
