---
title: 开始使用 Obsidian 管理个人知识库
date: 2023-03-27 11:37:20
updated: 2023-03-30 08:57:14
tag:
  - Obsidian
  - 笔记软件
---
跟大多数人一样，隔段时间总要折腾笔记软件。最近把笔记全部迁移到了 Obsidian（黑曜石），通过配置可支持全平台自动同步，目前用来还算是差强人意，分享一些使用心得。

<!--more-->

## 背景

主流的笔记软件都基本用过，各有优劣：

- 有道云笔记：最早使用的，同步比较省心，可惜当时不支持 Markdown
- 为知笔记：支持 Markdown，转收费后决定尝试一下印象笔记。
- 印象笔记：广告越变越多后转到了 Joplin。
- Joplin：自带多种同步方式，开源、可导出 MD 文件。除了颜值差点用起来还算稳定。
- Obsidian：全平台，高颜值，插件丰富，甚至可以自定义开屏页。虽然官方同步方案较贵，但是可自行搭建同步服务。

<center>
<img src="/images/2023/obsidian_homepage.png" />
<p style="font-size: 12px">图片来自 https://github.com/Rainbell129/Obsidian-Homepage</p>
</center>

<br />
<br />

## 同步

迁移到 Obsidian，首先要解决的问题就是多端同步。Obsidian 全平台的同步插件主要有两个：

- [Remotely save](https://github.com/remotely-save/remotely-save)
- [Live Sync](https://github.com/vrtmrz/obsidian-livesync)

查阅资料显示，Remotely save 与 IOS iCloud 同步可能存在冲突，并且目前的“保存时机”问题处理的不够完善，我这里是直接使用的 Live Sync 方式。

### Live Sync

服务端的搭建，使用 Docker 一键部署即可。客户端的设置官方文档写的不是很清楚，但花点时间能看懂。

第一台设备配置完成后，其他设备可以使用 `Setup URI` 进行同步配置。第一次配置主要是设置 `Remote Database configuration`， `Sync Setting`。我的插件不多也就不同步插件了。

如果想以本地数据为准，覆盖远程数据，可以在 Remote Database configuration 下选择 `Overwrite remtoe database`。

想锁定远程数据避免被其他客户端修改，可以在 Remote Database configuration 下选择 `Lock remtoe database`。后续其他客户端想继续同步，需要在在 `Local Database configuration` 下选择 `fetch rebuilt DB` 操作一次。

个人不推荐使用 `Sync Setting` - `Use trash for deleted files`，避免同步出错。

## 基础配置

### 为文件夹增加 emoji

参考 [https://github.com/kmaasrud/awesome-obsidian#css-snippets](https://github.com/kmaasrud/awesome-obsidian#css-snippets) 增加 CSS 文件：

custom-icons-differing-files-and-folders.css 为不同类型的文件和文件夹增加图标

```css
.nav-folder-children .nav-file-title-content:first-child::before {
  content: "🗒 ";
}

.nav-folder-children .nav-folder-title-content::before {
  content: "🗂 ";
}
```

custom-icons-for-specific-folders.css 为指定的文件夹增加图标

```css
div[data-path="Notes"] .nav-folder-title-content::before {
  content: "📘 ";
}

/* sub-path example */
/* div[data-path="Notes/Daily"] .nav-folder-title-content::before {
  content: "📆";
} */

```

## 实用的插件

可在插件市场搜索查看详情：

- Dataview
- Easy Typing
- Homepage
- Recent Files
- Search on Internet
- Self-hosted livesync
- Show Current File Path
