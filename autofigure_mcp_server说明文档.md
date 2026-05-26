# AutoFigure MCP 工具接口文档

## 服务信息

- **服务名称**: autofigure
- **MCP 端点**: `http://127.0.0.1:8765/autofigure`
- **协议**: MCP Streamable HTTP
- **当前 MCP 工具**: 仅 `autofigure_start_await`（同步等待，任务完成后返回）

## 启动服务

```bash
python autofigure_mcp_server.py --port 8765
```

生产环境示例：

```bash
gunicorn autofigure_mcp_server:create_app -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8765
```

环境变量从项目根目录 `.env` 加载，常用项见 `.env.example`（如 `AUTOFIGURE_API_KEY`、`AUTOFIGURE_IMAGE_MODEL`、`AUTOFIGURE_SAM_BACKEND` 等）。

## HTTP 辅助端点（非 MCP）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查，返回 `status`、`jobs` 数量等 |
| GET | `/tools` | 调试：列出已注册的 MCP 工具名称 |

示例：

```bash
curl http://127.0.0.1:8765/health
curl http://127.0.0.1:8765/tools
```

---

## 工具：autofigure_start_await

启动学术配图生成流程，**阻塞等待** `autofigure2.method_to_svg` 全流程结束后再返回。  
调用方在收到响应时即可使用 `output_dir` 与 `files` 中的产出路径。

> **耗时说明**：生图、SAM 分割、SVG 生成等步骤通常需数分钟至十余分钟。请确保 MCP 客户端、反向代理的 HTTP 读超时足够长，否则可能在任务完成前被客户端断开。

### 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| method_text | string | 二选一 | 论文 Method 章节文本 |
| input_figure_path | string | 二选一 | 已有示意图路径（跳过生图步骤） |
| output_dir | string | 否 | 输出目录；默认 `./output/job_{job_id}` |
| options | object | 否 | 可选配置，见下表 |

`method_text` 与 `input_figure_path` 必须且只能提供其一。

### options 字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sam_prompt | string | "icon,robot,animal,person" | SAM 检测提示词，逗号分隔 |
| placeholder_mode | string | "label" | 占位符模式: `none` / `box` / `label` |
| merge_threshold | float | 0.9 | Box 合并阈值 (0–1) |
| optimize_iterations | int | 0 | SVG 优化迭代次数 |
| image_size | string | "4K" | 生图分辨率: `1K` / `2K` / `4K` |
| enable_upscale | bool | true | 是否 4K 放大 |
| min_score | float | 0.5 | SAM 最低置信度 |

### 返回值

#### 成功（status: completed）

```json
{
  "job_id": "89dae780",
  "status": "completed",
  "message": "任务已完成",
  "output_dir": "D:/uni_paper_draw/Uni_AutoFigure/output/job_89dae780",
  "files": {
    "figure_png": ".../figure.png",
    "samed_png": ".../samed.png",
    "boxlib_json": ".../boxlib.json",
    "template_svg": ".../template.svg",
    "optimized_template_svg": ".../optimized_template.svg",
    "final_svg": ".../final.svg",
    "icons_dir": ".../icons"
  },
  "icon_count": 5,
  "no_icon_mode": false
}
```

`files` 中仅包含实际生成的文件；未产出的键不会出现。

| 字段 | 说明 |
|------|------|
| figure_png | 原始生成的学术示意图 |
| samed_png | 标记检测框的图片 |
| boxlib_json | 检测框坐标信息 |
| template_svg | LLM 生成的 SVG 模板 |
| optimized_template_svg | 优化后的 SVG 模板（有优化时） |
| final_svg | 最终 SVG |
| icons_dir | 裁切去背景图标目录 |

#### 执行失败（status: failed）

流程中抛出异常时返回（已创建 job 时带 `job_id`）：

```json
{
  "job_id": "89dae780",
  "status": "failed",
  "error": "具体错误信息",
  "output_dir": "D:/uni_paper_draw/Uni_AutoFigure/output/job_89dae780"
}
```

#### 参数校验失败（status: failed）

未创建任务，无 `job_id`：

```json
{
  "status": "failed",
  "error": "必须提供 method_text 或 input_figure_path 其中之一"
}
```

或：

```json
{
  "status": "failed",
  "error": "method_text 和 input_figure_path 不能同时使用"
}
```

### 调用示例（MCP tools/call）

从 Method 文本生成：

```json
{
  "name": "autofigure_start_await",
  "arguments": {
    "method_text": "We propose a novel attention mechanism...",
    "options": {
      "sam_prompt": "icon,diagram",
      "image_size": "2K",
      "optimize_iterations": 0
    }
  }
}
```

从已有图片生成：

```json
{
  "name": "autofigure_start_await",
  "arguments": {
    "input_figure_path": "D:/path/to/figure.png",
    "output_dir": "D:/path/to/output"
  }
}
```

### 内部执行步骤（current_step）

服务在内存 `JobManager` 中更新进度，便于日志与服务端调试。当前**未**单独暴露 `get_job_status` 等 MCP 工具；外部调用只需等待本工具返回即可。

| current_step | 说明 |
|--------------|------|
| initializing | 初始化 |
| preparing | 准备执行 |
| generating_figure | 生成学术图片 |
| segmenting | SAM 分割检测 |
| cropping | 裁切去背景 |
| generating_svg | 生成 SVG 模板 |
| optimizing_svg | 优化 SVG |
| replacing_icons | 替换图标 |
| finalizing | 整理输出 |
| completed | 已完成 |
| failed | 失败 |

---

## 测试

```bash
# 启动服务
python autofigure_mcp_server.py --port 8765

# 另开终端（需配置 .env 中的 API Key）
python test_mcp_service.py
```

`test_mcp_service.py` 中若仍包含对已移除工具（如 `autofigure_get_job_status`）的调用，以本文件与 `autofigure_mcp_server.py` 为准；主流程测试应直接根据 `autofigure_start_await` 返回的 `status` 与 `files` 断言。
