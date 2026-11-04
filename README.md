# awesome-lab-sites

Uni-Lab-OS 前端站点索引。`index.json` 列出可以连接 Uni-Lab-OS 微后端的前端站点：通用站、按学科主题进入的站点、社区维护的分发。
它与 [awesome-lab-devices](https://github.com/Xuwznln/awesome-lab-devices)（驱动包索引）是同一套模式——**浏览器直接读取，Edge 不需要出网、也不需要配置**。

两处会读它：

- **微后端导航页**：`unilab` 管理端口（默认 `8002`）的 `/` 页面。页面本身由微后端渲染，内置一条 OpenLab 兜底卡片；
  浏览器打开后再读本索引，把这里列出的站点补进「推荐前端」，索引不可达时只显示内置卡片。
- **OpenLab 前端**：顶栏的「站点」目录，列出本索引里的其他站点并标出当前所在的站点。

```text
浏览器 ──GET──▶ raw.githubusercontent.com/Xuwznln/awesome-lab-sites/main/index.json
   │
   ├─ unilab 的 http://<edge>:8002/          → 「推荐前端」卡片（内置 OpenLab 兜底 + 索引补充）
   └─ OpenLab 顶栏「站点」目录                 → 切换 / 打开其他站点，连接同一个微后端
```

## 收录的站点

| id | 站点 | 主题 | 说明 |
| --- | --- | --- | --- |
| `openlab` | [OpenLab](https://xuwznln.github.io/OpenLabSite/) | `general` | 通用实验前端：设备接入、流程编排、运行监控、物料追踪、驱动包安装；需要 unilabos ≥ 0.12.3 |

OpenLab 的源码在公开仓库 [OpenLabSite](https://github.com/Xuwznln/OpenLabSite)，由该仓库直接发布到 GitHub Pages。
OpenLabSite 只提供通用版，`?theme=` 参数不再生效；原学科版保留在旧仓库 Xuwznln/OpenLab 的
`archive/domain-editions-20260913` 分支，旧的 [OpenLab-site](https://github.com/Xuwznln/OpenLab-site)
构建（2026-08-24）早于 unilabos 0.12 的协议变更，不再收录。

## 索引格式

`index.json`（结构见 [`schema.json`](./schema.json)）：

```json
{
  "schema": "awesome-lab-sites/v1",
  "updated_at": "2026-09-04",
  "sites": [
    {
      "id": "openlab",
      "name": "OpenLab",
      "url": "https://xuwznln.github.io/OpenLabSite/",
      "description": "…",
      "homepage": "https://github.com/Xuwznln/OpenLabSite",
      "theme": "general",
      "protocol": "runtime.v1",
      "tags": ["general"],
      "official": true
    }
  ]
}
```

- `id`：索引内唯一的 slug（小写字母 / 数字 / `.` `_` `-`），前端用它去重和记忆选择。
- `url`：站点入口，必须 `https://`。可以带 query，供带学科主题的 fork 使用（OpenLabSite 通用版忽略 `?theme=`）。
- `theme`：进入时的学科主题。OpenLabSite 通用版只有 `general`；fork 可自定义。
- `protocol`：站点面向的微后端协议，当前只有 `runtime.v1`。
- `official`：缺省 `true`（本索引即官方目录）；社区维护的站点请标 `false`。

## 收录一个站点

1. 站点是静态可访问的 https 地址，能在连接面板里填微后端地址并按 `runtime.v1` 契约工作
   （fork OpenLab 是最省事的起点，见其 `AGENTS.md` 与 `docs/domain-customization.md`）；
2. 在 `index.json` 的 `sites` 末尾追加一条，更新 `updated_at`；
3. `node scripts/validate.mjs` 通过（CI 也会跑）；
4. 提 PR。

## 在别处使用这份索引

- **OpenLab 前端**：默认地址就是本仓库的 `main/index.json`，构建时可用 `VITE_OPENLAB_SITE_INDEX_URL` 改默认值（内网镜像 / fork）。
- **微后端导航页**：`unilabos/server/api/app.py` 的 `SITE_INDEX_URL` 指向本文件；内网部署可改成镜像地址。
