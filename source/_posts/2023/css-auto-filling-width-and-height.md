---
title: 使用 Flex 和 Grid 实现自动填充剩余宽度或高度
date: 2023-09-12 18:11:03
updated: 2023-09-12 18:11:03
tag:
  - css
  - 前端开发
---

通过 CSS Flex 和 Grid 布局实现父容器宽度/高度不定，子元素自动填充剩余宽度/高度。并且在子元素内容过大时，保证内容不要超出父容器。

<!--more-->

1. 父容器宽度不定，子元素自适应宽度，flex 实现。

<iframe height="300" style="width: 100%;" scrolling="no" title="自动填充剩余宽度-flex" src="https://codepen.io/gallenhu/embed/VwqbQEL?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/gallenhu/pen/VwqbQEL">
  自动填充剩余宽度-flex</a> by Gallen (<a href="https://codepen.io/gallenhu">@gallenhu</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>


关键代码是为 flex 子元素设置：

```css
.fix {
  width: 0;
  overflow: auto;
}
```

2. 父容器高度不定，子元素自适应高度，flex 实现。

<iframe height="300" style="width: 100%;" scrolling="no" title="自动填充剩余高度-flex" src="https://codepen.io/gallenhu/embed/LYMydZN?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/gallenhu/pen/LYMydZN">
  自动填充剩余高度-flex</a> by Gallen (<a href="https://codepen.io/gallenhu">@gallenhu</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

3. 父容器宽度不定，子元素自适应宽度，grid 实现。

<iframe height="300" style="width: 100%;" scrolling="no" title="自动填充剩余宽度/高度-grid" src="https://codepen.io/gallenhu/embed/wvRdmKy?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/gallenhu/pen/wvRdmKy">
  自动填充剩余宽度/高度-grid</a> by Gallen (<a href="https://codepen.io/gallenhu">@gallenhu</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

关键代码是为 grid 子元素设置：

```css
.fix {
  width: 100%;
  overflow: auto;
}
```
