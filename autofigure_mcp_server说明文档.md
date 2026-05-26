# AutoFigure MCP 工具接口文档

## 服务信息

- **服务名称**: autofigure
- **端点地址**: `http://127.0.0.1:8765/autofigure`
- **协议**: MCP Streamable HTTP

## 启动服务

```bash
python autofigure_mcp_server.py --port 8765
```

## 工具列表

---

### 1. autofigure_start_job

启动学术配图异步生成任务。

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| method_text | string | 二选一 | 论文 Method 章节文本 |
| input_figure_path | string | 二选一 | 已有图片路径（跳过生图步骤） |
| output_dir | string | 否 | 输出目录，默认 `./output/{job_id}` |
| options | object | 否 | 可选配置 |

**options 字段**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sam_prompt | string | "icon,robot,animal,person" | SAM 检测提示词，逗号分隔 |
| placeholder_mode | string | "label" | 占位符模式: none/box/label |
| merge_threshold | float | 0.9 | Box 合并阈值 (0-1) |
| optimize_iterations | int | 0 | SVG 优化迭代次数 |
| image_size | string | "4K" | 生图分辨率: 1K/2K/4K |
| enable_upscale | bool | true | 是否 4K 放大 |
| min_score | float | 0.5 | SAM 最低置信度 |

**返回值**

```json
{
  "job_id": "abc123",
  "status": "running",
  "message": "任务已启动",
  "output_dir": "/path/to/output"
}
```

---

### 2. autofigure_get_job_status

查询任务状态和进度。

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| job_id | string | 是 | 任务 ID |

**返回值**

```json
{
  "job_id": "abc123",
  "status": "running",
  "progress": 50,
  "current_step": "segmenting",
  "error": null,
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:05:00"
}
```

**status 取值**

| 值 | 说明 |
|----|------|
| pending | 等待中 |
| running | 执行中 |
| completed | 已完成 |
| failed | 失败 |
| cancelled | 已取消 |

**current_step 取值**

| 值 | 说明 |
|----|------|
| initializing | 初始化 |
| generating_figure | 生成学术图片 |
| segmenting | SAM 分割检测 |
| cropping | 裁切去背景 |
| generating_svg | 生成 SVG 模板 |
| optimizing_svg | 优化 SVG |
| replacing_icons | 替换图标 |
| finalizing | 整理输出 |

---

### 3. autofigure_get_artifacts

获取任务生成结果文件路径。

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| job_id | string | 是 | 任务 ID |

**返回值**

```json
{
  "status": "completed",
  "files": {
    "figure_png": "/path/to/figure.png",
    "samed_png": "/path/to/samed.png",
    "boxlib_json": "/path/to/boxlib.json",
    "template_svg": "/path/to/template.svg",
    "optimized_template_svg": "/path/to/optimized_template.svg",
    "final_svg": "/path/to/final.svg",
    "icons_dir": "/path/to/icons/"
  },
  "icon_count": 5,
  "output_dir": "/path/to/output/",
  "no_icon_mode": false
}
```

**files 字段说明**

| 字段 | 说明 |
|------|------|
| figure_png | 原始生成的学术示意图 |
| samed_png | 标记检测框的图片 |
| boxlib_json | 检测框坐标信息 |
| template_svg | LLM 生成的 SVG 模板 |
| optimized_template_svg | 优化后的 SVG 模板 |
| final_svg | 最终完成的 SVG |
| icons_dir | 裁切去背景的图标目录 |

---

### 4. autofigure_list_jobs

列出所有任务。

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 按状态过滤 |
| limit | int | 否 | 返回数量限制，默认 20 |

**返回值**

```json
{
  "jobs": [
    {
      "job_id": "abc123",
      "status": "completed",
      "progress": 100,
      "current_step": "completed",
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "total": 1,
  "filtered_by": null
}
```
