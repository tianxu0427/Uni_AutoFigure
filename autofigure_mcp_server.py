"""
AutoFigure MCP Server - 学术配图生成服务

该服务封装 autofigure2.py 的核心功能，提供 MCP 协议接口。
支持异步 Job 模式，适合长时间图像生成任务。

启动方式:
    # 开发模式
    python autofigure_mcp_server.py --port 8765

    # 生产模式（使用 gunicorn）
    gunicorn autofigure_mcp_server:create_app -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8765

MCP 工具列表:
    - autofigure_start_await: 启动生成任务并等待完成后返回

环境变量（从 .env 加载）:
    各模块独立配置见 .env.example（IMAGE_* / MULTIMODAL_* / SVG_FIX_* / SAM_VL_*）
    AUTOFIGURE_IMAGE_PROVIDER: 生图供应商 dashscope | openai
    AUTOFIGURE_IMAGE_MODEL: 生图模型（万相默认 wan2.6-t2i；openai 默认 gpt-image-2）
    AUTOFIGURE_IMAGE_API_KEY / AUTOFIGURE_IMAGE_BASE_URL: openai 生图专用（如 CloseAI）
    模块1 AUTOFIGURE_IMAGE_*: 文生图（步骤一）
    模块2 AUTOFIGURE_MULTIMODAL_*: 多模态 VL + SVG（步骤二/四/五）
    模块3 AUTOFIGURE_SVG_FIX_*: SVG 语法修复纯文本（步骤 4.5/4.6）
    AUTOFIGURE_SAM_BACKEND: SAM 后端（dashscope/roboflow/gitee/local）
    AUTOFIGURE_SAM_PROMPT: SAM 检测提示词
    ALIBABA_CLOUD_ACCESS_KEY_ID: 阿里云图像分割 AccessKey
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: 阿里云图像分割 Secret
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

# 在导入其他模块前加载 .env
from dotenv import load_dotenv

_PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(_PROJECT_ROOT / ".env")
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("autofigure-mcp")

# ============================================================================
# Job 状态定义
# ============================================================================

class JobStatus(TypedDict, total=False):
    """Job 状态结构"""
    job_id: str
    status: str  # pending, running, completed, failed, cancelled
    progress: int  # 0-100
    current_step: str
    result: Optional[Dict[str, Any]]
    error: Optional[str]
    created_at: str
    updated_at: str
    options: Dict[str, Any]


class JobManager:
    """Job 管理器 - 管理所有异步任务状态"""

    def __init__(self, max_jobs: int = 100):
        self._jobs: Dict[str, JobStatus] = {}
        self._max_jobs = max_jobs
        self._lock = asyncio.Lock()

    async def create_job(self, options: Dict[str, Any]) -> str:
        """创建新 Job，返回 job_id"""
        async with self._lock:
            # 清理旧 Job（超过上限时）
            if len(self._jobs) >= self._max_jobs:
                # 删除最早完成的 Job
                completed = [
                    (jid, job) for jid, job in self._jobs.items()
                    if job["status"] in ("completed", "failed", "cancelled")
                ]
                if completed:
                    completed.sort(key=lambda x: x[1].get("updated_at", ""))
                    for jid, _ in completed[:len(completed) // 2]:
                        del self._jobs[jid]

            job_id = str(uuid.uuid4())[:8]
            now = datetime.now().isoformat()
            self._jobs[job_id] = {
                "job_id": job_id,
                "status": "pending",
                "progress": 0,
                "current_step": "initializing",
                "result": None,
                "error": None,
                "created_at": now,
                "updated_at": now,
                "options": options,
            }
            logger.info(f"Created job: {job_id}")
            return job_id

    async def update_job(self, job_id: str, **kwargs) -> bool:
        """更新 Job 状态"""
        async with self._lock:
            if job_id not in self._jobs:
                return False
            job = self._jobs[job_id]
            job.update(kwargs)
            job["updated_at"] = datetime.now().isoformat()
            logger.debug(f"Updated job {job_id}: {kwargs}")
            return True

    def get_job(self, job_id: str) -> Optional[JobStatus]:
        """获取 Job 状态"""
        return self._jobs.get(job_id)

    def list_jobs(self, status: Optional[str] = None) -> List[JobStatus]:
        """列出所有 Job（可选按状态过滤）"""
        jobs = list(self._jobs.values())
        if status:
            jobs = [j for j in jobs if j["status"] == status]
        return sorted(jobs, key=lambda x: x["created_at"], reverse=True)

    async def delete_job(self, job_id: str) -> bool:
        """删除 Job（仅限已完成/失败/取消的）"""
        async with self._lock:
            if job_id not in self._jobs:
                return False
            job = self._jobs[job_id]
            if job["status"] not in ("completed", "failed", "cancelled"):
                return False
            del self._jobs[job_id]
            logger.info(f"Deleted job: {job_id}")
            return True


# 全局 Job 管理器
job_manager = JobManager()


# ============================================================================
# MCP 服务定义
# ============================================================================

try:
    from mcp.server.fastmcp import FastMCP
    from starlette.responses import JSONResponse
    from starlette.requests import Request
except ImportError as e:
    logger.error(
        f"Missing MCP dependencies. Install with: pip install mcp starlette uvicorn\n"
        f"Error: {e}"
    )
    sys.exit(1)

mcp = FastMCP(
    "autofigure",
    streamable_http_path="/autofigure",  # Streamable HTTP 端点
)


# ============================================================================
# 自定义 HTTP 路由（使用 FastMCP 公开 API）
# ============================================================================

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request: Request) -> JSONResponse:
    """健康检查端点"""
    return JSONResponse({
        "status": "healthy",
        "service": "autofigure-mcp",
        "version": "1.0.0",
        "jobs": len(job_manager._jobs),
    })


@mcp.custom_route("/tools", methods=["GET"])
async def list_tools(request: Request) -> JSONResponse:
    """列出所有可用工具（用于调试）"""
    return JSONResponse({
        "tools": [
            {
                "name": "autofigure_start_await",
                "description": "启动学术配图生成任务",
            },
        ]
    })


# ============================================================================
# MCP 工具定义
# ============================================================================

@mcp.tool()
async def autofigure_start_await(
    method_text: Optional[str] = None,
    input_figure_path: Optional[str] = None,
    output_dir: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    启动 AutoFigure 生成任务并阻塞等待完成。

    将论文 Method 文本或已有图片转换为学术风格的示意图和可编辑 SVG，
    仅在全流程结束后返回（含 output_dir 与产出文件路径）。

    Args:
        method_text: 论文 Method 章节文本内容。与 input_figure_path 二选一。
        input_figure_path: 已有的第一步图片路径。如果提供，则跳过生图步骤。
        output_dir: 输出目录路径。默认为 ./output/{job_id}。
        options: 可选配置字典，支持以下字段：
            - sam_prompt: SAM 检测提示词，逗号分隔（如 "icon,diagram,arrow"）
            - placeholder_mode: 占位符模式（none/box/label），默认 label
            - merge_threshold: Box 合并阈值（0-1），默认 0.9
            - optimize_iterations: SVG 优化迭代次数，默认 0
            - image_size: 生图分辨率（1K/2K/4K），默认 4K
            - enable_upscale: 是否 4K 放大，默认 True
            - min_score: SAM 最低置信度，默认 0.5

    Returns:
        任务完成后的结果字典，例如：
        {
            "job_id": "abc123",
            "status": "completed",
            "output_dir": "/path/to/output/job_abc123",
            "files": {"figure_png": "...", "final_svg": "..."},
            "icon_count": 5
        }
        失败时 status 为 "failed"，并包含 error 字段。

    Example:
        # 从 Method 文本生成
        result = await autofigure_start_await(
            method_text="We propose a novel attention mechanism...",
            options={"sam_prompt": "icon,diagram", "optimize_iterations": 2}
        )

        # 从已有图片生成
        result = await autofigure_start_await(
            input_figure_path="/path/to/figure.png",
            output_dir="/path/to/output"
        )
    """
    # 参数校验
    if not method_text and not input_figure_path:
        return {
            "error": "必须提供 method_text 或 input_figure_path 其中之一",
            "status": "failed"
        }

    if method_text and input_figure_path:
        return {
            "error": "method_text 和 input_figure_path 不能同时使用",
            "status": "failed"
        }

    # 合并选项
    opts = options or {}
    job_options = {
        "method_text": method_text,
        "input_figure_path": input_figure_path,
        "output_dir": output_dir,
        **opts
    }

    # 创建 Job
    job_id = await job_manager.create_job(job_options)

    # 确定输出目录
    if not output_dir:
        output_dir = str(_PROJECT_ROOT / "output" / f"job_{job_id}")

    # 更新选项中的输出目录
    job_options["output_dir"] = output_dir

    return await _run_autofigure_job(job_id, job_options)


# ============================================================================
# 后台任务执行
# ============================================================================

async def _run_autofigure_job(job_id: str, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行 AutoFigure 完整流程，完成后返回结果字典。
    """
    logger.info(f"Starting AutoFigure job: {job_id}")

    async def update(progress: int, step: str, **extra):
        await job_manager.update_job(job_id, progress=progress, current_step=step, **extra)

    try:
        await update(0, "initializing", status="running")

        # 导入 autofigure2 模块（延迟导入避免循环依赖）
        from autofigure2 import (
            method_to_svg,
            PlaceholderMode,
        )

        # 解析选项
        method_text = options.get("method_text")
        input_figure_path = options.get("input_figure_path")
        output_dir = options.get("output_dir", str(_PROJECT_ROOT / "output" / f"job_{job_id}"))

        # 可选参数
        sam_prompt = options.get("sam_prompt", "icon,robot,animal,person")
        placeholder_mode = options.get("placeholder_mode", "label")
        merge_threshold = float(options.get("merge_threshold", 0.9))
        optimize_iterations = int(options.get("optimize_iterations", 0))
        image_size = options.get("image_size", "4K")
        enable_upscale = options.get("enable_upscale", True)
        min_score = float(options.get("min_score", 0.5))

        # 验证参数
        if placeholder_mode not in ("none", "box", "label"):
            placeholder_mode = "label"
        if image_size not in ("1K", "2K", "4K"):
            image_size = "4K"

        # 设置 SAM prompt 环境变量（如果指定）
        if sam_prompt:
            os.environ["AUTOFIGURE_SAM_PROMPT"] = sam_prompt

        logger.info(f"Job {job_id} options: output_dir={output_dir}, "
                   f"placeholder_mode={placeholder_mode}, optimize_iterations={optimize_iterations}")

        # 使用线程池运行同步的 method_to_svg
        await update(5, "preparing")

        loop = asyncio.get_event_loop()

        # 定义进度回调
        progress_stages = {
            "generating_figure": (10, 30),
            "segmenting": (30, 50),
            "cropping": (50, 65),
            "generating_svg": (65, 80),
            "optimizing_svg": (80, 90),
            "replacing_icons": (90, 98),
        }

        # 在线程池中执行同步代码
        def run_method_to_svg():
            return method_to_svg(
                method_text=method_text,
                output_dir=output_dir,
                min_score=min_score,
                stop_after=5,
                placeholder_mode=placeholder_mode,
                optimize_iterations=optimize_iterations,
                merge_threshold=merge_threshold,
                image_size=image_size,
                enable_upscale=enable_upscale,
                input_figure_path=input_figure_path,
            )

        # 更新进度（简化版本，因为 method_to_svg 是同步的）
        await update(10, "generating_figure")

        result = await loop.run_in_executor(None, run_method_to_svg)

        await update(98, "finalizing")

        # 提取结果文件
        output_path = Path(output_dir)
        files = {
            "figure_png": result.get("figure_path"),
            "samed_png": result.get("samed_path"),
            "boxlib_json": result.get("boxlib_path"),
            "template_svg": result.get("template_svg_path"),
            "optimized_template_svg": result.get("optimized_template_path"),
            "final_svg": result.get("final_svg_path"),
            "icons_dir": str(output_path / "icons") if (output_path / "icons").exists() else None,
        }

        # 移除 None 值
        files = {k: v for k, v in files.items() if v}

        icon_infos = result.get("icon_infos", [])
        no_icon_mode = len(icon_infos) == 0

        result_payload = {
            "files": files,
            "icon_count": len(icon_infos),
            "output_dir": output_dir,
            "no_icon_mode": no_icon_mode,
        }
        await update(100, "completed", status="completed", result=result_payload)

        logger.info(f"Job {job_id} completed successfully. Output: {output_dir}")

        return {
            "job_id": job_id,
            "status": "completed",
            "message": "任务已完成",
            **result_payload,
        }

    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        output_dir = options.get("output_dir", str(_PROJECT_ROOT / "output" / f"job_{job_id}"))
        await update(progress=0, step="failed", status="failed", error=str(e))
        return {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
            "output_dir": output_dir,
        }


# ============================================================================
# Streamable HTTP Server 实现（使用 FastMCP 公开 API）
# ============================================================================

def create_app():
    """
    创建 Starlette ASGI 应用。

    使用 FastMCP 的 streamable_http_app() 公开 API，
    自动包含自定义路由（通过 @mcp.custom_route 注册）。
    """
    from starlette.middleware.cors import CORSMiddleware

    app = mcp.streamable_http_app()

    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
    return app


# ============================================================================
# 主入口
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AutoFigure MCP Server - 学术配图生成服务",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
    # 默认启动（端口 8765）
    python autofigure_mcp_server.py

    # 指定端口
    python autofigure_mcp_server.py --port 9000

    # 绑定特定地址
    python autofigure_mcp_server.py --host 0.0.0.0 --port 8765

MCP 连接地址:
    Streamable HTTP: http://127.0.0.1:8765/autofigure
        """
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="绑定地址（默认: 0.0.0.0）"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8765,
        help="监听端口（默认: 8765）"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="开发模式（自动重载）"
    )
    args = parser.parse_args()

    # 检查环境变量（各模块独立 Key，启动任务时由 autofigure2 校验）
    for env_name in (
        "AUTOFIGURE_IMAGE_API_KEY",
        "AUTOFIGURE_MULTIMODAL_API_KEY",
        "AUTOFIGURE_SVG_FIX_API_KEY",
        "AUTOFIGURE_SAM_VL_API_KEY",
    ):
        if not os.environ.get(env_name, "").strip():
            logger.warning("%s 未配置，相关步骤可能无法运行。", env_name)

    # 检查阿里云配置
    aly_key = os.environ.get("ALIBABA_CLOUD_ACCESS_KEY_ID", "").strip()
    if not aly_key:
        logger.warning(
            "ALIBABA_CLOUD_ACCESS_KEY_ID 未配置。步骤三去背景功能将无法使用。"
        )

    import uvicorn

    logger.info(f"Starting AutoFigure MCP Server on {args.host}:{args.port}")
    logger.info(f"Streamable HTTP endpoint: http://{args.host}:{args.port}/autofigure")
    logger.info(f"Health check: http://{args.host}:{args.port}/health")

    uvicorn.run(
        "autofigure_mcp_server:create_app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        factory=True,
    )


if __name__ == "__main__":
    main()
