# autofigure2.py 说明文档

> 本文档对应当前仓库版本：**仅支持阿里云百炼 DashScope**；API Key、模型名、SAM 后端等均从项目根目录 `.env` 读取，不再通过 `--provider` / `--api_key` 等命令行参数传入。

---

## 一、功能描述

`autofigure2.py` 将学术论文 Method 文本（或已有配图）自动转换为可编辑 SVG，主要能力包括：

1. **学术风格配图生成**：根据 Method 文本调用通义万相文生图，输出 `figure.png`
2. **图标区域检测**：检测图中图标/对象区域，生成 `boxlib.json` 与标记图 `samed.png`
3. **裁切与去背景**：按框裁切并用阿里云通用图像分割生成透明图标
4. **SVG 重建**：多模态模型根据原图与标记图生成 `template.svg`
5. **图标嵌入**：将透明图标替换进 SVG，得到 `final.svg`

---

## 二、API 与配置方式

### 2.1 唯一 API：阿里云百炼 DashScope

| 项目 | 值 |
|------|-----|
| 兼容模式 Base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 文生图 | 通义万相（`ImageSynthesis`，如 `wanx2.6-t2i`、`wanx2.1-t2i-turbo`） |
| 文本 / 多模态对话 | OpenAI 兼容 Chat Completions（如 `qwen3.6-plus`） |
| 物体定位（SAM 后端 `dashscope`） | Qwen-VL 返回 JSON 边界框（建议 `qwen3-vl-plus`） |

启动时由 `load_app_config()` 读取 `.env`，**不支持**便携 AI（bianxie）、自定义 OpenAI 兼容端点（custom）等其它 Provider。

### 2.2 环境变量一览

复制 `.env.example` 为 `.env` 后填写。完整注释见 `.env` 文件本身。

| 变量 | 必填 | 作用 |
|------|------|------|
| `AUTOFIGURE_API_KEY` | 是 | 百炼 API Key（生图、SVG、dashscope 物体定位） |
| `AUTOFIGURE_IMAGE_MODEL` | 否 | 步骤一文生图模型，默认 `wanx2.6-t2i` |
| `AUTOFIGURE_SVG_MODEL` | 否 | 步骤四/五 SVG 多模态模型，默认 `qwen3.6-plus` |
| `AUTOFIGURE_MULTIMODAL_MODEL` | 否 | 步骤二 `dashscope` 定位模型，默认 `qwen3-vl-plus` |
| `AUTOFIGURE_SAM_BACKEND` | 否 | 分割后端，默认 `fal` |
| `AUTOFIGURE_SAM_PROMPT` | 否 | 检测词表（逗号分隔），默认 `icon,robot,animal,person` |
| `AUTOFIGURE_SAM_MAX_MASKS` | 否 | fal 后端最大 mask 数（1–32），默认 `32` |
| `AUTOFIGURE_FAL_KEY` | fal 时 | fal.ai SAM3 |
| `AUTOFIGURE_ROBOFLOW_API_KEY` | roboflow 时 | Roboflow SAM3 |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` | 步骤三 | 阿里云 AccessKey ID |
| `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 步骤三 | 阿里云 AccessKey Secret |
| `ROBOFLOW_API_URL` | 否 | Roboflow 接口地址 |
| `ROBOFLOW_API_FALLBACK_URLS` | 否 | Roboflow 备用 URL，逗号分隔 |

### 2.3 推荐 `.env` 示例（DashScope 全流程）

```env
AUTOFIGURE_API_KEY=sk-your-key
AUTOFIGURE_IMAGE_MODEL=wanx2.1-t2i-turbo
AUTOFIGURE_SVG_MODEL=qwen3.6-plus
AUTOFIGURE_MULTIMODAL_MODEL=qwen3-vl-plus
AUTOFIGURE_SAM_BACKEND=dashscope
AUTOFIGURE_SAM_PROMPT=icon,robot,animal,person
ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret
```

---

## 三、流程概述

```
输入：paper method 文本 或 已有 figure 图片
    ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤一：通义万相生成学术风格图 → figure.png              │
│   （可 --input_figure_path 跳过；支持参考图风格）        │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤二：图标区域检测 + 标记 → samed.png + boxlib.json   │
│   后端：dashscope(VL) / fal / roboflow / local(SAM3)    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤三：按 box 裁切 + 阿里云通用图像分割去背景 → icons/*_nobg.png │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤四：多模态生成 SVG（4.5 语法修复，4.6 可选优化）     │
│   → template.svg / optimized_template.svg               │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤五：透明图标嵌入 SVG → final.svg                     │
└─────────────────────────────────────────────────────────┘
```

---

## 四、模块详解

### 4.1 配置加载：`load_app_config()`

- 读取 `.env`（程序启动时从 `autofigure2.py` 同目录加载）
- 返回 `api_key`、`base_url`、`image_gen_model`、`svg_gen_model`、`multimodal_model`、`sam_backend`、`sam_prompts`、`sam_max_masks`
- 未配置模型名时使用代码内默认值（见第二节表格）

### 4.2 DashScope API 调用

| 函数 | 用途 |
|------|------|
| `call_llm_image_generation()` | 步骤一，调用 `_call_dashscope_image_generation()` |
| `call_llm_multimodal()` | 步骤四/五及 SVG 修复，兼容模式多模态 Chat |
| `call_llm_text()` | 文本对话（如 SVG 语法修复） |
| `_call_sam_dashscope_vl_grounding()` | 步骤二，`AUTOFIGURE_SAM_BACKEND=dashscope` 时物体定位 |

### 4.3 步骤一：`generate_figure_from_method()`

- 根据 Method 文本构建英文 Prompt（可选参考图风格）
- 调用万相生图，默认将长边放大到 4K（`--disable_auto_upscale` 可关闭）
- CLI：`--use_reference_image` + `--reference_image_path`

### 4.4 步骤二：`segment_with_sam3()`

**支持的后端：**

| 后端 | 说明 | 密钥 |
|------|------|------|
| `dashscope` | 百炼 Qwen-VL 物体定位，返回 bbox JSON（**推荐，免装 SAM3**） | `AUTOFIGURE_API_KEY` |
| `fal` | fal.ai 托管 SAM3 | `AUTOFIGURE_FAL_KEY` |
| `roboflow` | Roboflow SAM3 | `AUTOFIGURE_ROBOFLOW_API_KEY` |
| `local` | 本地 SAM3 + GPU | 无（需提前下载权重） |

**输出：**

- `samed.png`：灰底黑框 + `<AF>01` 等标签
- `boxlib.json`：每个框的像素坐标与来源 prompt

**后处理：**

- 多 prompt 分别检测（`AUTOFIGURE_SAM_PROMPT` 逗号分隔）
- `merge_overlapping_boxes()`：按 `--merge_threshold` 合并高重叠框

**dashscope 后端说明**：详见 [多模态替代SAM3说明.md](./多模态替代SAM3说明.md)。

### 4.5 步骤三：`crop_and_remove_background()`

- 按 `boxlib.json` 裁切 → `icons/icon_AF01.png`
- `AliyunImageSegRemover` 调用阿里云通用图像分割 → `icons/icon_AF01_nobg.png`
- 需在 `.env` 配置 `ALIBABA_CLOUD_ACCESS_KEY_ID` 和 `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
- `--rmbg_model_path` 已废弃，保留仅用于兼容旧命令

### 4.6 步骤四：`generate_svg_template()` + `check_and_fix_svg()`

- 输入原图 + `samed.png`，多模态生成 SVG
- 占位符模式 `--placeholder_mode`：`none` / `box` / `label`（推荐 `label`）
- `lxml` 校验 XML，失败时 `fix_svg_with_llm()` 自动修复

### 4.7 步骤 4.6：`optimize_svg_with_llm()`

- 迭代对比原图优化位置与样式
- `--optimize_iterations 0` 跳过（默认 0）

### 4.8 步骤五：`replace_icons_in_svg()`

- 按 `<AF>xx` 标签或坐标将 `*_nobg.png` 嵌入 SVG
- 结合步骤 4.7 坐标缩放对齐

### 4.9 主入口：`method_to_svg()`

串联上述步骤；所有百炼相关配置在函数开头通过 `load_app_config()` 注入，**不接受** `provider` / `api_key` 等运行时覆盖参数。

---

## 五、模型与步骤对应关系

| 步骤 | 环境变量 | 代码默认（未设置 .env 时） |
|------|----------|---------------------------|
| 步骤一 生图 | `AUTOFIGURE_IMAGE_MODEL` | `wanx2.6-t2i` |
| 步骤二 定位（dashscope） | `AUTOFIGURE_MULTIMODAL_MODEL` | `qwen3-vl-plus` |
| 步骤四/五 SVG | `AUTOFIGURE_SVG_MODEL` | `qwen3.6-plus` |

说明：`AUTOFIGURE_MULTIMODAL_MODEL` 用于 **SAM 的 dashscope 后端**；SVG 生成使用 `AUTOFIGURE_SVG_MODEL`，二者可设为不同模型。

---

## 六、内网 / 离线部署要点

### 6.1 仍需外网的部分

| 组件 | 说明 |
|------|------|
| DashScope API | 生图、SVG、dashscope 物体定位均需访问百炼 |
| fal / Roboflow | 使用对应 SAM 云端后端时 |

### 6.2 可完全离线准备的部分

| 组件 | 方案 |
|------|------|
| **SAM3** | `AUTOFIGURE_SAM_BACKEND=local`，提前下载 HuggingFace 权重到缓存 |
| **阿里云通用图像分割** | 需要可访问阿里云 API，并配置 AccessKey 环境变量 |
| **Python 依赖** | `pip download` 打包 wheel |

内网若无法访问百炼，需自建兼容接口（当前版本**未内置** custom provider，需改代码或保持外网 DashScope）。

### 6.3 SAM3 本地权重（简要）

```bash
# 外网机器预下载后打包 ~/.cache/huggingface/hub/models--ycccccc--sam3-recap/
# 内网解压到相同路径，.env 设置：
AUTOFIGURE_SAM_BACKEND=local
```

### 6.4 阿里云通用图像分割配置（简要）

```bash
# .env 中配置阿里云 RAM 用户 AccessKey
ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret
```

---

## 七、命令行参数说明

> **以下参数仍可通过 CLI 指定**；API Key、模型名、SAM 后端与 prompt **仅**来自 `.env`。

### 7.1 输入 / 输出

| 参数 | 说明 |
|------|------|
| `--method_text` | 直接传入 Method 文本（与 `--method_file` / `--input_figure_path` 三选一） |
| `--method_file` | Method 文本文件路径 |
| `--input_figure_path` | 导入已有图片，跳过步骤一 |
| `--output_dir` | 输出目录，默认 `./output` |

### 7.2 步骤一

| 参数 | 说明 | 默认 |
|------|------|------|
| `--image_size` | 放大目标档位 `1K` / `2K` / `4K` | `4K` |
| `--disable_auto_upscale` | 禁用生图后 4K 长边放大 | 关闭 |
| `--use_reference_image` | 启用参考图风格 | 关闭 |
| `--reference_image_path` | 参考图路径 | - |

### 7.3 步骤二 / 三

| 参数 | 说明 | 默认 |
|------|------|------|
| `--min_score` | 检测框最低置信度（dashscope 无 score 时多为 1.0） | `0.0` |
| `--merge_threshold` | 框合并重叠阈值，`0` 表示不合并 | `0.001` |
| `--rmbg_model_path` | 已废弃，保留用于兼容旧命令 | 无 |

SAM 相关 **不在 CLI**：`AUTOFIGURE_SAM_BACKEND`、`AUTOFIGURE_SAM_PROMPT`、`AUTOFIGURE_SAM_MAX_MASKS` 见 `.env`。

### 7.4 步骤四 / 五

| 参数 | 说明 | 默认 |
|------|------|------|
| `--placeholder_mode` | `none` / `box` / `label` | `label` |
| `--optimize_iterations` | SVG 优化迭代次数，`0` 跳过 | `0` |
| `--stop_after` | 执行到第 N 步停止（1–5） | `5` |

SVG / 生图 **模型名不在 CLI**：见 `AUTOFIGURE_IMAGE_MODEL`、`AUTOFIGURE_SVG_MODEL`。

---

## 八、使用示例

### 8.1 标准流程（推荐）

```bash
# 配置好 .env 后：直接运行
python autofigure2.py --method_file paper.txt --output_dir ./output
```

### 8.2 导入已有配图

```bash
python autofigure2.py --input_figure_path ./my_figure.png --output_dir ./output
```

### 8.3 参考图风格 + 完整流程

```bash
python autofigure2.py \
  --method_file paper.txt \
  --use_reference_image \
  --reference_image_path ./ref_style.png \
  --output_dir ./output
```

### 8.4 只跑到步骤二（检查分割）

```bash
python autofigure2.py --method_file paper.txt --stop_after 2
```

### 8.5 启用 SVG 优化

```bash
python autofigure2.py --method_file paper.txt --optimize_iterations 2
```

---

## 九、Web 服务与 Docker

- **Web**（`server.py`）：子进程调用 `autofigure2.py`，同样读取服务端目录下的 `.env`；页面不再选择 Provider，密钥请在 `.env` 配置。
- **Docker**：`docker-compose.yml` 使用 `env_file: .env` 注入环境变量。

---

## 十、输出文件结构

```
output/
├── figure.png
├── samed.png
├── boxlib.json
├── icons/
│   ├── icon_AF01.png
│   ├── icon_AF01_nobg.png
│   └── ...
├── template.svg
├── optimized_template.svg    # --optimize_iterations > 0 时
└── final.svg
```

---

## 十一、注意事项

1. **配置方式**：修改 `.env` 后重新运行；不要将 API Key 提交到 Git。
2. **物体定位**：国内推荐 `AUTOFIGURE_SAM_BACKEND=dashscope` + `AUTOFIGURE_MULTIMODAL_MODEL=qwen3-vl-plus`，无需安装 SAM3。
3. **阿里云通用图像分割**：须开通视觉智能开放平台能力，并设置 `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET`。
4. **步骤二默认后端**：未设置 `AUTOFIGURE_SAM_BACKEND` 时代码默认为 `fal`，使用 DashScope 全流程时请在 `.env` 中显式写 `dashscope`。
5. **合并阈值**：`--merge_threshold` 默认 `0.001`（几乎不合并）；若需积极去重可改为 `0.9`。
6. **相关文档**：
   - [多模态替代SAM3说明.md](./多模态替代SAM3说明.md) — dashscope 分割原理
   - [.env.example](./.env.example) — 环境变量模板

---

## 十二、版本变更摘要（相对旧版文档）

| 变更项 | 说明 |
|--------|------|
| 移除 bianxie / custom | 仅 DashScope |
| 移除 CLI `--provider` / `--api_key` / `--image_model` / `--svg_model` 等 | 统一 `.env` |
| 新增 `AUTOFIGURE_*` 环境变量体系 | 见第二节 |
| SAM 新增 `dashscope` 后端 | Qwen-VL 物体定位 |
| Web UI | Provider/API Key 改为说明性文案，配置走 `.env` |
