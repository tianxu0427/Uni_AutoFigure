(() => {
  const INPUT_STATE_KEY = "autofigure_input_state_v2";
  const IMPORT_STATE_KEY = "autofigure_import_state_v1";
  const LOCALE_KEY = "autofigure_locale_v1";
  const BIANXIE_BASE_URL = "https://api.bianxie.ai/v1";
  const DEFAULT_CUSTOM_BASE_URL = "";
  const CUSTOM_BASE_URL_PLACEHOLDER = "https://your-provider.example/v1";
  const LEGACY_CUSTOM_BASE_URLS = new Set([BIANXIE_BASE_URL]);
  let currentLocale = loadLocale();
  const localeListeners = [];
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";

  const I18N = {
    en: {
      providers: {
        gemini: "Gemini",
        bianxie: "Bianxie AI",
        openai_response: "OpenAI Responses",
        openrouter: "OpenRouter",
        custom: "Custom",
        openai_images: "OpenAI Images",
        same_as_svg: "Same as SVG path",
      },
      routeKinds: {
        responses: "Responses API",
        default: "default route",
      },
      upload: {
        only_images: "Only image files are supported.",
        uploading: "Uploading image...",
        uploaded_reference: "Using uploaded reference: {name}",
        uploaded_stage1: "Imported figure ready: {name}",
        upload_failed: "Upload failed",
        reference_ready: "Reference image ready.",
        stage1_ready: "Imported stage-1 figure ready.",
        request_failed: "Request failed",
        failed_to_start: "Failed to start job",
      },
      input: {
        subtitle: "Generate SVG templates and preview every step.",
        import_entry: "I already have the stage-1 figure",
        guide_entry: "I don't know how to fill this",
        method_label: "Method Text",
        method_placeholder: "Paste your paper method text here...",
        method_hint: "Tip: concise, structured method text yields cleaner templates.",
        pipeline_label: "Pipeline Routing",
        pipeline_caption: "Switch reasoning and image generation paths independently.",
        route_step1: "Step 1 Raster",
        route_step4: "Step 4 SVG",
        provider_label: "SVG / Reasoning Provider",
        provider_caption: "Controls text reasoning and SVG reconstruction.",
        provider_bianxie_meta: "GPT-image-2 and Gemini route for mainland China users",
        provider_gemini_meta: "Google multimodal route",
        provider_openai_meta: "Use the Responses API format",
        provider_openrouter_meta: "OpenAI-compatible relay",
        provider_custom_meta: "Custom OpenAI-compatible endpoint",
        svg_model_label: "SVG Model",
        svg_model_caption: "Editable model id for the current SVG / reasoning route.",
        svg_model_hint: "Switch provider with buttons above; this field stays editable for manual overrides.",
        image_provider_label: "Step 1 Image Provider",
        image_provider_caption: "You can keep it linked to the SVG path or override it.",
        image_model_label: "Image Model",
        image_model_caption: "Editable model id for the step 1 image route.",
        image_model_hint: "Default is `gpt-image-2`. You can replace it with any compatible image model id.",
        api_key_label: "Primary API Key",
        api_key_hint: "Used by the selected SVG / reasoning provider. Reused for images when possible.",
        bianxie_register_hint: 'Register at <a href="https://bianxieai.com/autofigure" target="_blank" rel="noopener noreferrer">bianxieai</a>.',
        base_url_label: "Custom API URL",
        base_url_hint: "Required for Custom. Use the OpenAI-compatible /v1 root URL, not a specific endpoint path.",
        custom_url_required: "Custom API URL required",
        image_api_key_label: "Image Provider API Key",
        image_api_key_placeholder: "Optional override for the image path",
        image_base_url_label: "Image Provider API URL",
        optimize_label: "Optimize",
        image_size_label: "Image Size",
        upscale_label: "Auto Upscale",
        upscale_text: "Upscale figure.png to a 4K long edge while preserving aspect ratio",
        sam_backend_label: "SAM3 Backend",
        sam_prompt_label: "SAM Prompt",
        sam_api_key_label: "SAM3 API Key",
        sam_api_key_placeholder: "FAL/Roboflow API key",
        reference_image_label: "Reference Image",
        reference_upload_text: "Drop image here or click to upload",
        confirm_btn: "Confirm -> Canvas",
        starting: "Starting...",
        error_method_required: "Please provide method text.",
        error_custom_base_url_required:
          "Please fill Custom API URL as an OpenAI-compatible /v1 root URL.",
        error_custom_image_base_url_required:
          "Please fill Image Provider API URL for the Custom image route.",
        route_note_openai_linked:
          "Same as SVG path resolves step 1 to OpenAI Images, so one OpenAI-compatible key is usually enough.",
        route_note_override:
          "Step 1 is overriding the SVG path. Use the secondary image key only if the image route uses different credentials.",
        route_note_linked:
          "Step 1 and step 4 stay linked. Switch either row with the buttons above.",
        image_api_key_hint_linked:
          "Not required while step 1 stays linked to the primary route.",
        image_api_key_hint_override:
          "Used only for the {provider} image path if it should not reuse the primary key.",
        image_base_url_hint_custom:
          "Defaults to the primary Custom API URL, but you can override it for step 1.",
        image_base_url_hint_default:
          "Used only when the step 1 image route switches to Custom.",
      },
      importPage: {
        brand: "Import Stage-1 Figure",
        subtitle: "Skip step 1 generation and continue from an existing academic figure.",
        back: "Back to Method Workflow",
        figure_label: "Stage-1 Figure",
        upload_text: "Drop the first-stage academic figure here or click to upload",
        figure_hint:
          "This image becomes <code>figure.png</code>. The pipeline will start from SAM segmentation and SVG reconstruction.",
        route_label: "Import Route",
        route_caption: "Only SAM and SVG stages remain in this workflow.",
        workflow_label: "Workflow",
        workflow_value: "Imported Figure -> SAM -> SVG",
        step1_label: "Step 1",
        step1_value: "Skipped",
        route_note:
          "The default 4K aspect-ratio-preserving preprocessing still applies after import.",
        provider_label: "SVG / Reasoning Provider",
        provider_caption: "Controls multimodal SVG reconstruction.",
        svg_model_label: "SVG Model",
        svg_model_hint: "Editable model id for SVG reconstruction.",
        api_key_label: "Primary API Key",
        api_key_hint: "Used only for the SVG / reasoning provider in import mode.",
        bianxie_register_hint: 'Register at <a href="https://bianxieai.com/autofigure" target="_blank" rel="noopener noreferrer">bianxieai</a>.',
        base_url_label: "Custom API URL",
        base_url_hint:
          "Required for Custom. Use the OpenAI-compatible /v1 root URL, not a specific endpoint path.",
        sam_backend_label: "SAM3 Backend",
        sam_prompt_label: "SAM Prompt",
        sam_api_key_label: "SAM3 API Key",
        sam_api_key_placeholder: "FAL/Roboflow API key",
        confirm_btn: "Continue From Uploaded Figure",
        starting: "Starting...",
        error_upload_required: "Please upload the stage-1 figure first.",
        error_api_key_required: "Please provide the SVG / reasoning API key.",
        error_custom_base_url_required:
          "Please fill Custom API URL as an OpenAI-compatible /v1 root URL.",
      },
      guide: {
        brand: "Configuration Guide",
        subtitle: "A practical guide for each field, each workflow, and recommended presets.",
        back_input: "AutoFigure-Edit",
        back_import: "I already have the stage-1 figure",
        overview_title: "Choose the Right Workflow",
        overview_copy:
          "Start from method text if you want the full pipeline. Start from import mode if you already have the stage-1 academic raster figure and only want SAM + SVG.",
        method_kicker: "Workflow A",
        method_title: "Method Text Workflow",
        method_copy:
          "Use the main page when you want AutoFigure-Edit to generate the first-stage image for you.",
        import_kicker: "Workflow B",
        import_title: "Import Existing Figure",
        import_copy:
          "Use the import page when you already have the academic raster figure and want to continue directly from segmentation and SVG reconstruction.",
        presets_title: "Recommended Presets",
        preset1_title: "Preset 1: OpenAI Main Route",
        preset1_copy:
          "SVG / Reasoning Provider: OpenAI Responses. Step 1 Image Provider: Same as SVG path. Image Model: gpt-image-2. SVG Model: gpt-5.5.",
        preset2_title: "Preset 2: Gemini + OpenAI Images",
        preset2_copy:
          "SVG / Reasoning Provider: Gemini. Step 1 Image Provider: OpenAI Images. Image Model: gpt-image-2. Use this if you prefer Gemini SVG reconstruction but OpenAI image generation.",
        preset3_title: "Preset 3: Custom Relay",
        preset3_copy:
          "Choose Bianxie AI for the built-in aggregate route, or choose Custom and fill Custom API URL when you use your own OpenAI-compatible relay.",
        pipeline_steps_title: "What the Pipeline Actually Does",
        step1_kicker: "Step 1",
        step1_title: "Generate or Import figure.png",
        step1_copy:
          "The system either generates the academic raster figure from method text, or accepts your uploaded stage-1 figure directly.",
        step2_kicker: "Step 2",
        step2_title: "Run SAM3 segmentation",
        step2_copy:
          "SAM3 detects icon-like regions and creates labeled placeholders plus box metadata.",
        step3_kicker: "Step 3",
        step3_title: "Crop icons and remove background",
        step3_copy:
          "Each detected icon is cropped and cleaned so later replacement in SVG becomes easier.",
        step4_kicker: "Step 4",
        step4_title: "Rebuild as SVG",
        step4_copy:
          "The multimodal model reconstructs the figure as editable SVG while respecting the placeholder layout from SAM.",
        step5_kicker: "Step 5",
        step5_title: "Replace placeholders and finalize",
        step5_copy:
          "Placeholder boxes are replaced by processed icons and the final SVG is written for editing or export.",
        main_steps_title: "Main Page: Step-by-Step Filling Guide",
        main_step1_title: "1. Paste method text",
        main_step1_copy:
          "Start with the method section, not the abstract. Include the pipeline logic, components, arrows, stages, and notable visual entities that should appear in the figure.",
        main_step2_title: "2. Choose SVG / Reasoning Provider",
        main_step2_copy:
          "This decides how SVG reconstruction works. If you do not want to think too much, use OpenAI Responses or Gemini first.",
        main_step3_title: "3. Decide whether step 1 should follow or override",
        main_step3_copy:
          "Keep Step 1 Image Provider linked unless you specifically want a different image model or a different service for the raster generation stage.",
        main_step4_title: "4. Fill API key and Custom URL only when needed",
        main_step4_copy:
          "For OpenAI Responses + linked OpenAI Images, one compatible API key is often enough. Fill Custom API URL only if you selected Custom on that route.",
        main_step5_title: "5. Tune image model, SVG model, and SAM settings",
        main_step5_copy:
          "Leave the defaults first, then only adjust model ids or SAM prompt/backend if you know what is failing or what visual style you need.",
        import_steps_title: "Import Page: Step-by-Step Filling Guide",
        import_step1_title: "1. Upload the stage-1 academic figure",
        import_step1_copy:
          "This should be the raster figure that normally would have been produced by step 1. Do not upload the reference image or a final SVG here.",
        import_step2_title: "2. Choose only the SVG / reasoning route",
        import_step2_copy:
          "Import mode skips image generation, so there is no step 1 image provider to fill. You only need to decide how SAM and SVG reconstruction should continue.",
        import_step3_title: "3. Fill SVG model and API key",
        import_step3_copy:
          "Use the default SVG model first. Change it only if you know your provider exposes a better model for multimodal SVG reconstruction.",
        import_step4_title: "4. Configure SAM backend",
        import_step4_copy:
          "SAM still runs in import mode. You must choose whether it uses local SAM3, fal.ai, or Roboflow, and provide the corresponding key if the backend requires one.",
        fields_title: "What Each Field Means",
        field_method_title: "Method Text",
        field_method_copy:
          "Paste the method section of your paper. The cleaner and more structural it is, the better the generated figure tends to be.",
        field_provider_title: "SVG / Reasoning Provider",
        field_provider_copy:
          "Controls the text reasoning and the multimodal SVG reconstruction stage. This is the most important provider selector on the page.",
        field_image_provider_title: "Step 1 Image Provider",
        field_image_provider_copy:
          "Controls only the first-stage raster image generation. Leave it linked if you do not need to separate the image path from the SVG path.",
        field_custom_url_title: "Custom API URL",
        field_custom_url_copy:
          "Used only when the route is Custom. Fill the OpenAI-compatible base URL provided by your relay or gateway.",
        field_image_model_title: "Image Model",
        field_image_model_copy:
          "Default is gpt-image-2 for OpenAI Images. You can manually replace it with any compatible image model id if needed.",
        field_svg_model_title: "SVG Model",
        field_svg_model_copy:
          "Default follows the selected reasoning route. The default for OpenAI Responses is gpt-5.5, while Gemini/OpenRouter/Custom use the Gemini defaults unless you know you need a different id.",
        field_upscale_title: "Auto Upscale",
        field_upscale_copy:
          "Enabled by default. It enlarges figure.png to a 4K long edge while preserving aspect ratio. Keep it on unless you specifically want the original resolution.",
        field_sam_title: "SAM Settings",
        field_sam_copy:
          "SAM Backend selects how segmentation runs. SAM Prompt controls what objects the model should try to detect, such as icons, people, robots, or animals.",
        sam_title: "SAM3 Backend Guide",
        sam_local_title: "Local (SAM3)",
        sam_local_copy:
          "Best when you already installed SAM3 locally and want everything on your own machine. No external API key is needed, but local dependencies must be ready.",
        sam_fal_title: "fal.ai API",
        sam_fal_copy:
          "Good if you do not want to install SAM3 locally and you have a FAL key. Usually stable, but it is an external paid API route.",
        sam_roboflow_title: "Roboflow API",
        sam_roboflow_copy:
          "Often the easiest hosted SAM option. Use this when you want a remote backend and your environment can reach the Roboflow endpoint.",
        sam_prompt_title: "How to Fill SAM Prompt",
        sam_prompt_copy:
          "Think of SAM Prompt as the object vocabulary. Use comma-separated words such as `icon,person,robot,animal` or add domain words like `diagram,cell,molecule,arrow`.",
        sam_when_title: "When to Change SAM Backend",
        sam_when_copy:
          "If local SAM3 is unavailable, switch to fal.ai or Roboflow. If remote APIs are slow or inaccessible, local becomes the fallback if your environment supports it.",
        sam_key_title: "When a SAM API Key Is Required",
        sam_key_copy:
          "Local does not need a SAM API key. fal.ai needs a FAL key. Roboflow needs a Roboflow key. If the SAM backend is local, leave the SAM API key blank.",
        examples_title: "Common Filling Examples",
        example1_title: "I only want the easiest stable setup",
        example1_copy:
          "Main page. Provider = OpenAI Responses. Image Provider = Same as SVG path. Image Model = gpt-image-2. SVG Model = gpt-5.5. Fill one API key.",
        example2_title: "I already have the stage-1 figure",
        example2_copy:
          "Import page. Upload the figure. Choose Provider = OpenAI Responses or Gemini. Fill SVG Model and API Key. Leave image settings alone because step 1 is skipped.",
        example3_title: "I use a relay / private API gateway",
        example3_copy:
          "Choose Custom on the route you want to redirect. Fill Custom API URL with your gateway base URL, then fill the matching API key.",
        help_badge: "Need more help?",
        help_title: "Still not sure?",
        help_copy:
          "Try consulting the project knowledge base for a more detailed explanation and up-to-date context.",
        help_button: "Open DeepWiki",
      },
      canvas: {
        brand: "AutoFigure-Edit Canvas",
        status_label: "Status:",
        waiting: "Waiting",
        back_config: "Back to Config",
        back_import: "Back to Import",
        back_history: "Back to History",
        history_ready: "Historical result loaded",
        history_not_found: "History job not found",
        image_preview_title: "Image preview",
        image_preview_body: "This historical run does not include a final SVG yet.",
        logs: "Logs",
        job: "Job",
        fallback_title: "SVG-Edit not installed",
        fallback_body:
          'Drop an SVG-Edit build into <code>web/vendor/svg-edit/</code> (editor/index.html) to enable editing.',
        artifacts: "Artifacts",
        missing_job: "Missing job id",
        steps: {
          figure: "Figure generated",
          samed: "SAM3 segmentation",
          icon_raw: "Icons extracted",
          icon_nobg: "Icons refined",
          template_svg: "Template SVG ready",
          optimized_template_svg: "Optimized template ready",
          final_svg: "Final SVG ready",
        },
      },
      history: {
        nav: "History",
        brand: "History",
        subtitle: "Saved AutoFigure-Edit outputs.",
        back_input: "Back to Method Workflow",
        back_import: "Back to Import Workflow",
        refresh: "Refresh",
        summary_title: "Saved Images",
        count: "{count} items",
        loading: "Loading...",
        empty_title: "No history yet",
        empty_body: "Saved outputs will appear here after a run writes files into outputs/.",
        open: "Open",
        complete: "Complete",
        partial: "Partial",
        artifacts: "{count} artifacts",
        updated: "Updated {time}",
        unknown_time: "Unknown time",
      },
    },
    zh: {
      providers: {
        gemini: "Gemini",
        bianxie: "便携AI",
        openai_response: "OpenAI Responses",
        openrouter: "OpenRouter",
        custom: "自定义",
        openai_images: "OpenAI 图像",
        same_as_svg: "与 SVG 路径一致",
      },
      routeKinds: {
        responses: "Responses API",
        default: "默认路由",
      },
      upload: {
        only_images: "仅支持图片文件。",
        uploading: "正在上传图片...",
        uploaded_reference: "参考图已上传：{name}",
        uploaded_stage1: "第一阶段图片已上传：{name}",
        upload_failed: "上传失败",
        reference_ready: "参考图已就绪。",
        stage1_ready: "导入的第一阶段图片已就绪。",
        request_failed: "请求失败",
        failed_to_start: "启动失败",
      },
      input: {
        subtitle: "生成 SVG 模板并预览每个步骤。",
        import_entry: "我已经有第一阶段的图片了",
        guide_entry: "我不知道怎么填",
        method_label: "方法文本",
        method_placeholder: "请粘贴论文的方法部分文本...",
        method_hint: "提示：结构清晰、简洁的方法文本通常会得到更干净的模板。",
        pipeline_label: "流程路由",
        pipeline_caption: "可以分别切换推理路径和生图路径。",
        route_step1: "步骤 1 位图",
        route_step4: "步骤 4 SVG",
        provider_label: "SVG / 推理 Provider",
        provider_caption: "控制文本推理和 SVG 重建。",
        provider_bianxie_meta: "支持中国大陆使用 GPT-image-2 和 Gemini 的聚合路线",
        provider_gemini_meta: "Google 多模态路线",
        provider_openai_meta: "使用 Responses API 格式",
        provider_openrouter_meta: "兼容 OpenAI 的中继路线",
        provider_custom_meta: "自定义 OpenAI 兼容接口",
        svg_model_label: "SVG 模型",
        svg_model_caption: "当前 SVG / 推理路线对应的可编辑模型 id。",
        svg_model_hint: "上方按钮切换 provider；这里可以继续手动覆盖模型 id。",
        image_provider_label: "步骤 1 图片 Provider",
        image_provider_caption: "可以跟随 SVG 路径，也可以单独覆盖。",
        image_model_label: "图片模型",
        image_model_caption: "步骤 1 生图路线对应的可编辑模型 id。",
        image_model_hint: "默认是 `gpt-image-2`。你也可以替换为任何兼容的图片模型 id。",
        api_key_label: "主 API Key",
        api_key_hint: "用于当前 SVG / 推理 provider；在可复用时也会用于图片路线。",
        bianxie_register_hint: '注册链接：<a href="https://bianxieai.com/autofigure" target="_blank" rel="noopener noreferrer">bianxieai</a>。',
        base_url_label: "自定义 API URL",
        base_url_hint: "Custom 必填。请填写兼容 OpenAI 的 /v1 根路径，不要填具体 endpoint。",
        custom_url_required: "需要填写自定义 API URL",
        image_api_key_label: "图片路线 API Key",
        image_api_key_placeholder: "图片路线单独覆盖时再填写",
        image_base_url_label: "图片路线 API URL",
        optimize_label: "优化轮数",
        image_size_label: "图片尺寸",
        upscale_label: "自动放大",
        upscale_text: "将 figure.png 等比例放大到 4K 长边",
        sam_backend_label: "SAM3 后端",
        sam_prompt_label: "SAM Prompt",
        sam_api_key_label: "SAM3 API Key",
        sam_api_key_placeholder: "FAL/Roboflow API key",
        reference_image_label: "参考图片",
        reference_upload_text: "拖拽图片到这里，或点击上传",
        confirm_btn: "确认并进入画布",
        starting: "正在启动...",
        error_method_required: "请先填写方法文本。",
        error_custom_base_url_required:
          "请填写自定义 API URL，格式应为兼容 OpenAI 的 /v1 根路径。",
        error_custom_image_base_url_required:
          "请为 Custom 图片路线填写图片路线 API URL。",
        route_note_openai_linked:
          "当与 SVG 路径一致且使用 OpenAI Responses 时，步骤 1 会自动落到 OpenAI Images，所以通常一套 OpenAI 兼容 Key 就够了。",
        route_note_override:
          "步骤 1 当前已脱离 SVG 路径独立配置。只有当图片路线需要单独凭据时，才需要填写第二套 Key。",
        route_note_linked:
          "步骤 1 和步骤 4 当前保持联动。你可以通过上面的按钮分别切换它们。",
        image_api_key_hint_linked:
          "当步骤 1 跟随主路径时，这里通常不需要填写。",
        image_api_key_hint_override:
          "仅当 {provider} 图片路线不想复用主 Key 时才需要填写。",
        image_base_url_hint_custom:
          "默认沿用主 Custom API URL，也可以单独覆盖步骤 1 的地址。",
        image_base_url_hint_default:
          "仅当步骤 1 图片路线切到 Custom 时才会使用这里的地址。",
      },
      importPage: {
        brand: "导入第一阶段图片",
        subtitle: "跳过步骤 1 生图，直接从现成的学术图片继续。",
        back: "返回文本工作流",
        figure_label: "第一阶段图片",
        upload_text: "把第一阶段学术图片拖到这里，或点击上传",
        figure_hint:
          "这张图片会成为 <code>figure.png</code>，后续流程将直接从 SAM 分割和 SVG 重建开始。",
        route_label: "导入路线",
        route_caption: "这个工作流只保留 SAM 和 SVG 阶段。",
        workflow_label: "流程",
        workflow_value: "导入图片 -> SAM -> SVG",
        step1_label: "步骤 1",
        step1_value: "已跳过",
        route_note: "导入后仍会默认执行 4K 等比例预处理。",
        provider_label: "SVG / 推理 Provider",
        provider_caption: "控制多模态 SVG 重建。",
        svg_model_label: "SVG 模型",
        svg_model_hint: "可自由填写用于 SVG 重建的模型 id。",
        api_key_label: "主 API Key",
        api_key_hint: "导入模式下只用于 SVG / 推理 provider。",
        bianxie_register_hint: '注册链接：<a href="https://bianxieai.com/autofigure" target="_blank" rel="noopener noreferrer">bianxieai</a>。',
        base_url_label: "自定义 API URL",
        base_url_hint:
          "Custom 必填。请填写兼容 OpenAI 的 /v1 根路径，不要填具体 endpoint。",
        sam_backend_label: "SAM3 后端",
        sam_prompt_label: "SAM Prompt",
        sam_api_key_label: "SAM3 API Key",
        sam_api_key_placeholder: "FAL/Roboflow API key",
        confirm_btn: "从已上传图片继续",
        starting: "正在启动...",
        error_upload_required: "请先上传第一阶段图片。",
        error_api_key_required: "请先填写 SVG / 推理 API Key。",
        error_custom_base_url_required:
          "请填写自定义 API URL，格式应为兼容 OpenAI 的 /v1 根路径。",
      },
      guide: {
        brand: "配置指南",
        subtitle: "按字段、按工作流、按常见方案解释每一项该怎么填。",
        back_input: "AutoFigure-Edit",
        back_import: "我已经有第一阶段的图片了",
        overview_title: "先选对工作流",
        overview_copy:
          "如果你要跑完整流程，就从方法文本开始；如果你已经有第一阶段学术位图，就走导入模式，只做 SAM + SVG。",
        method_kicker: "工作流 A",
        method_title: "方法文本工作流",
        method_copy:
          "当你希望 AutoFigure-Edit 帮你自动生成第一阶段图片时，使用主页面。",
        import_kicker: "工作流 B",
        import_title: "导入已有图片",
        import_copy:
          "当你已经有学术位图，只想继续做分割和 SVG 重建时，使用导入页面。",
        presets_title: "推荐填写方案",
        preset1_title: "方案 1：OpenAI 主路线",
        preset1_copy:
          "SVG / 推理 Provider 选 OpenAI Responses，步骤 1 图片 Provider 保持与 SVG 路径一致，Image Model 用 gpt-image-2，SVG Model 用 gpt-5.5。",
        preset2_title: "方案 2：Gemini + OpenAI Images",
        preset2_copy:
          "SVG / 推理 Provider 选 Gemini，步骤 1 图片 Provider 改成 OpenAI Images，Image Model 用 gpt-image-2。适合你想保留 Gemini 的 SVG 重建，但生图想走 OpenAI。",
        preset3_title: "方案 3：自定义中转 / 网关",
        preset3_copy:
          "内置聚合路线可选择便携AI；如果你使用自己的 OpenAI 兼容中转或私有网关，则选择 Custom 并填写对应的 Custom API URL。",
        pipeline_steps_title: "完整流程 1 到 5 步在做什么",
        step1_kicker: "步骤 1",
        step1_title: "生成或导入 figure.png",
        step1_copy:
          "系统要么根据方法文本生成第一阶段学术位图，要么直接接收你上传的第一阶段图片。",
        step2_kicker: "步骤 2",
        step2_title: "运行 SAM3 分割",
        step2_copy:
          "SAM3 会检测图标类区域，并生成带标签的占位框和对应的 box 元数据。",
        step3_kicker: "步骤 3",
        step3_title: "裁切图标并去背景",
        step3_copy:
          "每个检测到的图标都会被裁切并清理背景，以便后续更容易放回 SVG。",
        step4_kicker: "步骤 4",
        step4_title: "重建为 SVG",
        step4_copy:
          "多模态模型会参考原图和 SAM 占位信息，把整张图重建成可编辑的 SVG。",
        step5_kicker: "步骤 5",
        step5_title: "替换占位符并输出最终结果",
        step5_copy:
          "系统会把占位框替换成处理后的图标，并写出最终 SVG 用于编辑或导出。",
        main_steps_title: "主页面怎么一步步填写",
        main_step1_title: "1. 先贴方法文本",
        main_step1_copy:
          "尽量贴方法部分而不是摘要。把流程逻辑、组件、箭头、阶段划分和关键视觉对象都写清楚。",
        main_step2_title: "2. 先选 SVG / 推理 Provider",
        main_step2_copy:
          "这一步决定 SVG 重建怎么跑。如果你不想想太多，先用 OpenAI Responses 或 Gemini。",
        main_step3_title: "3. 再决定步骤 1 是否跟随或单独覆盖",
        main_step3_copy:
          "如果你并不明确需要拆开生图路径和 SVG 路径，就让 Step 1 Image Provider 保持联动。",
        main_step4_title: "4. 只在需要时填写 API Key 和 Custom URL",
        main_step4_copy:
          "如果是 OpenAI Responses 且图片路线保持联动，通常一套兼容 Key 就够了。只有在选了 Custom 时才需要填写 Custom API URL。",
        main_step5_title: "5. 最后再改模型和 SAM 设置",
        main_step5_copy:
          "建议先保留默认值，只有在你明确知道当前失败点或目标风格时，再去改模型 id、SAM Prompt 或 SAM Backend。",
        import_steps_title: "导入页面怎么一步步填写",
        import_step1_title: "1. 上传第一阶段学术图片",
        import_step1_copy:
          "这里上传的应该是本来会由步骤 1 生成的位图，不要上传参考图，也不要上传最终 SVG。",
        import_step2_title: "2. 只选 SVG / 推理路线",
        import_step2_copy:
          "导入模式已经跳过生图，所以不需要再填写步骤 1 的图片路线。你只需要决定后续 SVG 重建怎么跑。",
        import_step3_title: "3. 填 SVG 模型和 API Key",
        import_step3_copy:
          "先用默认 SVG 模型即可。只有当你明确知道当前 provider 暴露了更适合的多模态模型时，再手动改。",
        import_step4_title: "4. 配置 SAM 后端",
        import_step4_copy:
          "导入模式仍然需要 SAM。你要明确它是走本地 SAM3、fal.ai，还是 Roboflow，并根据后端填写对应 Key。",
        fields_title: "每个字段是什么意思",
        field_method_title: "方法文本",
        field_method_copy:
          "粘贴论文的方法部分。结构越清晰、越贴近真实论文方法，生成出的图通常越稳定。",
        field_provider_title: "SVG / 推理 Provider",
        field_provider_copy:
          "控制文本推理和多模态 SVG 重建阶段。这是页面里最重要的 provider 选择器。",
        field_image_provider_title: "步骤 1 图片 Provider",
        field_image_provider_copy:
          "只控制第一阶段的位图生成。如果你不需要把生图路径和 SVG 路径拆开，保持联动即可。",
        field_custom_url_title: "Custom API URL",
        field_custom_url_copy:
          "只有在路线选择为 Custom 时才需要填写。这里填你的中转、网关或兼容 OpenAI 的 base URL。",
        field_image_model_title: "图片模型",
        field_image_model_copy:
          "OpenAI Images 默认推荐 gpt-image-2。如果你知道自己要换别的图片模型，也可以直接手填模型 id。",
        field_svg_model_title: "SVG 模型",
        field_svg_model_copy:
          "默认会跟随当前推理路线。OpenAI Responses 默认是 gpt-5.5；Gemini/OpenRouter/Custom 默认沿用 Gemini 系列模型，除非你明确知道要改。",
        field_upscale_title: "自动放大",
        field_upscale_copy:
          "默认开启，会把 figure.png 等比例放大到 4K 长边。除非你明确要保留原分辨率，否则建议保持开启。",
        field_sam_title: "SAM 设置",
        field_sam_copy:
          "SAM Backend 决定分割怎么跑；SAM Prompt 决定模型优先检测哪些对象，例如图标、人物、机器人、动物。",
        sam_title: "SAM3 后端说明",
        sam_local_title: "Local (SAM3)",
        sam_local_copy:
          "适合你已经在本地装好了 SAM3，并希望整个流程都在自己的机器上跑。它不需要外部 API key，但本地依赖必须准备好。",
        sam_fal_title: "fal.ai API",
        sam_fal_copy:
          "适合你不想本地安装 SAM3，但手里有 FAL key 的情况。通常比较稳，但它是外部付费 API 路线。",
        sam_roboflow_title: "Roboflow API",
        sam_roboflow_copy:
          "通常是托管 SAM 里最容易上手的一条路。如果你想用远端分割，且环境能访问 Roboflow，就可以优先尝试它。",
        sam_prompt_title: "SAM Prompt 怎么填",
        sam_prompt_copy:
          "可以把 SAM Prompt 理解成“对象词表”。常见写法是逗号分隔的词，比如 `icon,person,robot,animal`，也可以根据领域加上 `diagram,cell,molecule,arrow` 这类词。",
        sam_when_title: "什么时候要切换 SAM Backend",
        sam_when_copy:
          "如果本地 SAM3 不可用，就切到 fal.ai 或 Roboflow；如果远端 API 连不上或太慢，而你的环境支持本地 SAM3，那本地就是回退方案。",
        sam_key_title: "什么时候需要 SAM API Key",
        sam_key_copy:
          "Local 不需要 SAM API key；fal.ai 需要 FAL key；Roboflow 需要 Roboflow key。如果你选的是 local，就把 SAM API key 留空。",
        examples_title: "常见填写示例",
        example1_title: "我只想要最稳最省事的配置",
        example1_copy:
          "主页面。Provider 选 OpenAI Responses，Image Provider 保持与 SVG 路径一致，Image Model 用 gpt-image-2，SVG Model 用 gpt-5.5，只填一套 API Key。",
        example2_title: "我已经有第一阶段图片了",
        example2_copy:
          "导入页面。上传图片后，Provider 选 OpenAI Responses 或 Gemini，填写 SVG Model 和 API Key 即可。图片相关设置不用再管，因为步骤 1 已经跳过。",
        example3_title: "我在用中转 / 私有 API 网关",
        example3_copy:
          "在你想重定向的路线里选择 Custom，然后把 Custom API URL 改成你的网关地址，再填写对应的 API Key。",
        help_badge: "还需要帮助？",
        help_title: "仍然不会？",
        help_copy:
          "请尝试前往项目知识库查看更多说明与最新上下文，里面会有更完整的解释和补充材料。",
        help_button: "点击前往 DeepWiki 咨询",
      },
      canvas: {
        brand: "AutoFigure-Edit 画布",
        status_label: "状态：",
        waiting: "等待中",
        back_config: "返回配置页",
        back_import: "返回导入页",
        back_history: "返回历史图片",
        history_ready: "已加载历史结果",
        history_not_found: "未找到历史任务",
        image_preview_title: "图片预览",
        image_preview_body: "这个历史任务还没有最终 SVG。",
        logs: "日志",
        job: "任务",
        fallback_title: "SVG-Edit 未安装",
        fallback_body:
          '请将 SVG-Edit 构建产物放到 <code>web/vendor/svg-edit/</code>（editor/index.html）下以启用编辑。',
        artifacts: "素材",
        missing_job: "缺少 job id",
        steps: {
          figure: "图片已生成",
          samed: "SAM3 分割完成",
          icon_raw: "图标已裁切",
          icon_nobg: "图标已去背景",
          template_svg: "模板 SVG 已就绪",
          optimized_template_svg: "优化模板已就绪",
          final_svg: "最终 SVG 已就绪",
        },
      },
      history: {
        nav: "历史图片",
        brand: "历史图片",
        subtitle: "已保存的 AutoFigure-Edit 输出。",
        back_input: "返回文本工作流",
        back_import: "返回导入工作流",
        refresh: "刷新",
        summary_title: "已保存图片",
        count: "{count} 项",
        loading: "正在加载...",
        empty_title: "暂无历史图片",
        empty_body: "运行结果写入 outputs/ 后，会显示在这里。",
        open: "打开",
        complete: "已完成",
        partial: "未完成",
        artifacts: "{count} 个素材",
        updated: "更新于 {time}",
        unknown_time: "未知时间",
      },
    },
  };

  function loadLocale() {
    try {
      const stored = window.localStorage.getItem(LOCALE_KEY);
      if (stored === "zh" || stored === "en") {
        return stored;
      }
    } catch (_err) {
      // Ignore storage failures.
    }
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("zh") ? "zh" : "en";
  }

  function saveLocale(locale) {
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function t(key, vars = {}) {
    const parts = key.split(".");
    let value = I18N[currentLocale];
    for (const part of parts) {
      value = value?.[part];
    }
    if (value == null) {
      value = I18N.en;
      for (const part of parts) {
        value = value?.[part];
      }
    }
    if (typeof value !== "string") {
      return key;
    }
    return value.replace(/\{(\w+)\}/g, (_, name) => `${vars[name] ?? ""}`);
  }

  function setLocale(locale) {
    if (locale !== "zh" && locale !== "en") {
      return;
    }
    currentLocale = locale;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    saveLocale(locale);
    refreshLanguageSwitchers();
    for (const listener of localeListeners) {
      listener(currentLocale);
    }
  }

  function onLocaleChange(listener) {
    localeListeners.push(listener);
    listener(currentLocale);
  }

  function refreshLanguageSwitchers() {
    document.querySelectorAll("[data-lang-switch] .lang-chip").forEach((button) => {
      const active = button.dataset.lang === currentLocale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindLanguageSwitchers() {
    document.querySelectorAll("[data-lang-switch] .lang-chip").forEach((button) => {
      button.addEventListener("click", () => setLocale(button.dataset.lang || "en"));
    });
    refreshLanguageSwitchers();
  }

  function setText(id, value) {
    const element = $(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setHTML(id, value) {
    const element = $(id);
    if (element) {
      element.innerHTML = value;
    }
  }

  function setPlaceholder(id, value) {
    const element = $(id);
    if (element) {
      element.placeholder = value;
    }
  }

  function normalizeProviderValue(value) {
    return value;
  }

  function normalizeImageProviderValue(value) {
    return value;
  }

  function normalizeCustomBaseUrl(value) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return LEGACY_CUSTOM_BASE_URLS.has(trimmed) ? "" : trimmed;
  }

  const page = document.body.dataset.page;
  bindLanguageSwitchers();
  if (page === "input") {
    initInputPage();
  } else if (page === "import") {
    initImportPage();
  } else if (page === "guide") {
    initGuidePage();
  } else if (page === "history") {
    initHistoryPage();
  } else if (page === "canvas") {
    initCanvasPage();
  }

  function $(id) {
    return document.getElementById(id);
  }

  function initInputPage() {
    const confirmBtn = $("confirmBtn");
    const errorMsg = $("errorMsg");
    const providerInput = $("provider");
    const imageProviderInput = $("imageProvider");
    const imageModelInput = $("imageModel");
    const svgModelInput = $("svgModel");
    const providerButtons = $("providerButtons");
    const imageProviderButtons = $("imageProviderButtons");
    const imageRouteSummary = $("imageRouteSummary");
    const svgRouteSummary = $("svgRouteSummary");
    const routeSummaryNote = $("routeSummaryNote");
    const uploadZone = $("uploadZone");
    const referenceFile = $("referenceFile");
    const referencePreview = $("referencePreview");
    const referenceStatus = $("referenceStatus");
    const imageSizeGroup = $("imageSizeGroup");
    const imageSizeInput = $("imageSize");
    const imageModelGroup = $("imageModelGroup");
    const svgModelGroup = $("svgModelGroup");
    const baseUrlGroup = $("baseUrlGroup");
    const baseUrlInput = $("baseUrl");
    const imageApiKeyGroup = $("imageApiKeyGroup");
    const imageApiKeyInput = $("imageApiKey");
    const imageApiKeyHint = $("imageApiKeyHint");
    const bianxieRegisterHint = $("bianxieRegisterHint");
    const imageBaseUrlGroup = $("imageBaseUrlGroup");
    const imageBaseUrlInput = $("imageBaseUrl");
    const imageBaseUrlHint = $("imageBaseUrlHint");
    const upscaleEnabled = $("upscaleEnabled");
    const samBackend = $("samBackend");
    const samPrompt = $("samPrompt");
    const samApiKeyGroup = $("samApiKeyGroup");
    const samApiKeyInput = $("samApiKey");
    let uploadedReferencePath = null;

    function getProviderLabel(provider) {
      const normalized = normalizeProviderValue(provider);
      if (normalized === "openai_response") {
        return t("providers.openai_response");
      }
      if (normalized === "openrouter") {
        return t("providers.openrouter");
      }
      if (normalized === "bianxie") {
        return t("providers.bianxie");
      }
      if (normalized === "gemini") {
        return t("providers.gemini");
      }
      return t("providers.custom");
    }

    function getImageProviderLabel(provider) {
      const normalized = normalizeImageProviderValue(provider);
      if (normalized === "same") {
        return t("providers.same_as_svg");
      }
      if (normalized === "openai") {
        return t("providers.openai_images");
      }
      return getProviderLabel(normalized);
    }

    function loadInputState() {
      try {
        const raw = window.sessionStorage.getItem(INPUT_STATE_KEY);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (_err) {
        return null;
      }
    }

    function saveInputState() {
      const state = {
        methodText: $("methodText")?.value ?? "",
        provider: normalizeProviderValue(providerInput?.value ?? "bianxie"),
        imageProvider: normalizeImageProviderValue(imageProviderInput?.value ?? "same"),
        imageModel: imageModelInput?.value ?? "",
        svgModel: svgModelInput?.value ?? "",
        apiKey: $("apiKey")?.value ?? "",
        baseUrl: normalizeCustomBaseUrl(baseUrlInput?.value ?? DEFAULT_CUSTOM_BASE_URL),
        imageApiKey: imageApiKeyInput?.value ?? "",
        imageBaseUrl: normalizeCustomBaseUrl(imageBaseUrlInput?.value ?? DEFAULT_CUSTOM_BASE_URL),
        optimizeIterations: $("optimizeIterations")?.value ?? "0",
        imageSize: imageSizeInput?.value ?? "4K",
        upscaleEnabled: upscaleEnabled?.checked ?? true,
        samBackend: samBackend?.value ?? "fal",
        samPrompt: samPrompt?.value ?? "icon,person,robot,animal",
        samApiKey: samApiKeyInput?.value ?? "",
        referencePath: uploadedReferencePath,
        referenceUrl: referencePreview?.src ?? "",
        referenceStatus: referenceStatus?.textContent ?? "",
      };
      try {
        window.sessionStorage.setItem(INPUT_STATE_KEY, JSON.stringify(state));
      } catch (_err) {
        // Ignore storage failures (e.g. private mode / quota)
      }
    }

    function applyInputState() {
      const state = loadInputState();
      if (!state) {
        return;
      }
      if (typeof state.methodText === "string") {
        $("methodText").value = state.methodText;
      }
      if (typeof state.provider === "string" && providerInput) {
        providerInput.value = normalizeProviderValue(state.provider);
      }
      if (typeof state.imageProvider === "string" && imageProviderInput) {
        imageProviderInput.value = normalizeImageProviderValue(state.imageProvider);
      }
      if (typeof state.imageModel === "string" && imageModelInput) {
        imageModelInput.value = state.imageModel;
      }
      if (typeof state.svgModel === "string" && svgModelInput) {
        svgModelInput.value = state.svgModel;
      }
      if (typeof state.apiKey === "string") {
        $("apiKey").value = state.apiKey;
      }
      if (typeof state.baseUrl === "string" && baseUrlInput) {
        baseUrlInput.value = normalizeCustomBaseUrl(state.baseUrl);
      }
      if (typeof state.imageApiKey === "string" && imageApiKeyInput) {
        imageApiKeyInput.value = state.imageApiKey;
      }
      if (typeof state.imageBaseUrl === "string" && imageBaseUrlInput) {
        imageBaseUrlInput.value = normalizeCustomBaseUrl(state.imageBaseUrl);
      }
      if (typeof state.optimizeIterations === "string" && $("optimizeIterations")) {
        $("optimizeIterations").value = state.optimizeIterations;
      }
      if (typeof state.imageSize === "string" && imageSizeInput) {
        imageSizeInput.value = state.imageSize;
      }
      if (typeof state.upscaleEnabled === "boolean" && upscaleEnabled) {
        upscaleEnabled.checked = state.upscaleEnabled;
      }
      if (typeof state.samBackend === "string" && samBackend) {
        samBackend.value = state.samBackend;
      }
      if (typeof state.samPrompt === "string" && samPrompt) {
        samPrompt.value = state.samPrompt;
      }
      if (typeof state.samApiKey === "string" && samApiKeyInput) {
        samApiKeyInput.value = state.samApiKey;
      }
      if (typeof state.referencePath === "string" && state.referencePath) {
        uploadedReferencePath = state.referencePath;
      }
      if (
        referencePreview &&
        typeof state.referenceUrl === "string" &&
        state.referenceUrl
      ) {
        referencePreview.src = state.referenceUrl;
        referencePreview.classList.add("visible");
      }
      if (
        referenceStatus &&
        typeof state.referenceStatus === "string" &&
        state.referenceStatus
      ) {
        referenceStatus.textContent = state.referenceStatus;
      }
    }

    function setupChoiceGroup(group, input) {
      if (!group || !input) {
        return;
      }
      const buttons = Array.from(group.querySelectorAll("[data-value]"));

      function applyChoice() {
        const value = input.value;
        for (const button of buttons) {
          const active = button.dataset.value === value;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        }
      }

      for (const button of buttons) {
        button.addEventListener("click", () => {
          input.value = button.dataset.value || "";
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }

      input.addEventListener("change", applyChoice);
      applyChoice();
    }

    function getEffectiveImageProvider() {
      const provider = normalizeProviderValue(providerInput?.value ?? "bianxie");
      const override = normalizeImageProviderValue(imageProviderInput?.value ?? "same");
      if (override !== "same") {
        return override;
      }
      return provider === "openai_response" ? "openai" : provider;
    }

    function getDefaultSvgModel(provider) {
      if (provider === "openai_response") {
        return "gpt-5.5";
      }
      if (provider === "openrouter") {
        return "google/gemini-3.1-pro-preview";
      }
      return "gemini-3.1-pro-preview";
    }

    function getDefaultImageModel(provider) {
      if (provider === "openai") {
        return "gpt-image-2";
      }
      if (provider === "bianxie") {
        return "gpt-image-2";
      }
      if (provider === "openrouter") {
        return "google/gemini-3.1-flash-image-preview";
      }
      return "gemini-3.1-flash-image-preview";
    }

    function getResolvedPrimaryBaseUrl() {
      return normalizeCustomBaseUrl(baseUrlInput?.value ?? DEFAULT_CUSTOM_BASE_URL);
    }

    function getResolvedImageBaseUrl() {
      const imageProviderSource = normalizeImageProviderValue(imageProviderInput?.value ?? "same");
      if (imageProviderSource === "same") {
        return getResolvedPrimaryBaseUrl();
      }
      return normalizeCustomBaseUrl(imageBaseUrlInput?.value ?? "") || getResolvedPrimaryBaseUrl();
    }

    function syncModelDefaults() {
      const provider = normalizeProviderValue(providerInput?.value ?? "bianxie");
      const effectiveImageProvider = getEffectiveImageProvider();

      if (svgModelInput) {
        const nextSvgDefault = getDefaultSvgModel(provider);
        const previousSvgDefault = svgModelInput.dataset.suggestedDefault || "";
        const currentSvgValue = svgModelInput.value.trim();
        if (!currentSvgValue || currentSvgValue === previousSvgDefault) {
          svgModelInput.value = nextSvgDefault;
        }
        svgModelInput.dataset.suggestedDefault = nextSvgDefault;
        svgModelInput.placeholder = nextSvgDefault;
      }

      if (imageModelInput) {
        const nextImageDefault = getDefaultImageModel(effectiveImageProvider);
        const previousImageDefault = imageModelInput.dataset.suggestedDefault || "";
        const currentImageValue = imageModelInput.value.trim();
        if (!currentImageValue || currentImageValue === previousImageDefault) {
          imageModelInput.value = nextImageDefault;
        }
        imageModelInput.dataset.suggestedDefault = nextImageDefault;
        imageModelInput.placeholder = nextImageDefault;
      }
    }

    function updateRouteSummary() {
      const provider = normalizeProviderValue(providerInput?.value ?? "bianxie");
      const effectiveImageProvider = getEffectiveImageProvider();
      const imageProviderSource = normalizeImageProviderValue(imageProviderInput?.value ?? "same");
      const selectedImageModel = imageModelInput?.value.trim() || getDefaultImageModel(effectiveImageProvider);
      const selectedSvgModel = svgModelInput?.value.trim() || getDefaultSvgModel(provider);

      const imageProviderLabel =
        imageProviderSource === "same"
          ? `${getProviderLabel(provider)} -> ${getImageProviderLabel(effectiveImageProvider)}`
          : getImageProviderLabel(effectiveImageProvider);

      const imageSuffix =
        effectiveImageProvider === "gemini" && imageSizeInput
          ? ` · ${imageSizeInput.value}`
          : "";
      const customSuffix =
        effectiveImageProvider === "custom"
          ? ` @ ${getResolvedImageBaseUrl() || t("input.custom_url_required")}`
          : "";
      const svgCustomSuffix =
        provider === "custom"
          ? ` @ ${getResolvedPrimaryBaseUrl() || t("input.custom_url_required")}`
          : "";

      if (imageRouteSummary) {
        imageRouteSummary.textContent = `${imageProviderLabel} · ${selectedImageModel}${imageSuffix}${customSuffix}`;
      }
      if (svgRouteSummary) {
        const providerLabel = getProviderLabel(provider);
        const routeKind =
          provider === "openai_response" ? t("routeKinds.responses") : t("routeKinds.default");
        svgRouteSummary.textContent = `${providerLabel} · ${selectedSvgModel} · ${routeKind}${svgCustomSuffix}`;
      }

      if (routeSummaryNote) {
        if (provider === "openai_response" && imageProviderSource === "same") {
          routeSummaryNote.textContent = t("input.route_note_openai_linked");
        } else if (imageProviderSource !== "same") {
          routeSummaryNote.textContent = t("input.route_note_override");
        } else {
          routeSummaryNote.textContent = t("input.route_note_linked");
        }
      }
    }

    function syncRoutingControls() {
      const provider = normalizeProviderValue(providerInput?.value ?? "bianxie");
      const imageProviderSource = normalizeImageProviderValue(imageProviderInput?.value ?? "same");
      const effectiveImageProvider = getEffectiveImageProvider();

      syncModelDefaults();

      if (svgModelGroup) {
        svgModelGroup.hidden = false;
      }
      if (imageModelGroup) {
        imageModelGroup.hidden = false;
      }
      if (baseUrlGroup) {
        baseUrlGroup.hidden = provider !== "custom";
      }
      if (imageSizeGroup) {
        imageSizeGroup.hidden = effectiveImageProvider !== "gemini";
      }
      if (imageApiKeyGroup) {
        imageApiKeyGroup.hidden = imageProviderSource === "same";
      }
      if (imageBaseUrlGroup) {
        imageBaseUrlGroup.hidden = imageProviderSource !== "custom";
      }
      if (
        imageProviderSource === "custom" &&
        imageBaseUrlInput &&
        !imageBaseUrlInput.value.trim() &&
        getResolvedPrimaryBaseUrl()
      ) {
        imageBaseUrlInput.value = getResolvedPrimaryBaseUrl();
      }
      if (imageApiKeyHint) {
        imageApiKeyHint.textContent =
          imageProviderSource === "same"
            ? t("input.image_api_key_hint_linked")
            : t("input.image_api_key_hint_override", {
                provider: getImageProviderLabel(imageProviderSource),
              });
      }
      if (imageBaseUrlHint) {
        imageBaseUrlHint.textContent =
          imageProviderSource === "custom"
            ? t("input.image_base_url_hint_custom")
            : t("input.image_base_url_hint_default");
      }
      if (bianxieRegisterHint) {
        bianxieRegisterHint.hidden = provider !== "bianxie" && effectiveImageProvider !== "bianxie";
      }

      updateRouteSummary();
      saveInputState();
    }

    function syncSamApiKeyVisibility() {
      const shouldShow =
        samBackend &&
        (samBackend.value === "fal" ||
          samBackend.value === "roboflow" ||
          samBackend.value === "dashscope");
      if (samApiKeyGroup) {
        samApiKeyGroup.hidden = !shouldShow;
      }
      if (!shouldShow && samApiKeyInput) {
        samApiKeyInput.value = "";
      }
      saveInputState();
    }

    applyInputState();

    setupChoiceGroup(providerButtons, providerInput);
    setupChoiceGroup(imageProviderButtons, imageProviderInput);

    function applyInputLocale() {
      setText("inputPageSubtitle", t("input.subtitle"));
      setText("importEntryBtn", t("input.import_entry"));
      setText("inputGuideBtn", t("input.guide_entry"));
      setText("inputHistoryBtn", t("history.nav"));
      setText("methodTextLabel", t("input.method_label"));
      setPlaceholder("methodText", t("input.method_placeholder"));
      setText("methodHint", t("input.method_hint"));
      setText("pipelineRoutingLabel", t("input.pipeline_label"));
      setText("pipelineRoutingCaption", t("input.pipeline_caption"));
      setText("routeStep1Label", t("input.route_step1"));
      setText("routeStep4Label", t("input.route_step4"));
      setText("providerLabel", t("input.provider_label"));
      setText("providerCaption", t("input.provider_caption"));
      setText("providerBianxieTitle", t("providers.bianxie"));
      setText("providerBianxieMeta", t("input.provider_bianxie_meta"));
      setText("providerGeminiTitle", t("providers.gemini"));
      setText("providerGeminiMeta", t("input.provider_gemini_meta"));
      setText("providerOpenAIResponsesTitle", t("providers.openai_response"));
      setText("providerOpenAIResponsesMeta", t("input.provider_openai_meta"));
      setText("providerOpenRouterTitle", t("providers.openrouter"));
      setText("providerOpenRouterMeta", t("input.provider_openrouter_meta"));
      setText("providerCustomTitle", t("providers.custom"));
      setText("providerCustomMeta", t("input.provider_custom_meta"));
      setText("svgModelLabel", t("input.svg_model_label"));
      setText("svgModelCaption", t("input.svg_model_caption"));
      setText("svgModelHint", t("input.svg_model_hint"));
      setText("imageProviderLabel", t("input.image_provider_label"));
      setText("imageProviderCaption", t("input.image_provider_caption"));
      setText("imageProviderSameLabel", t("providers.same_as_svg"));
      setText("imageProviderOpenAILabel", t("providers.openai_images"));
      setText("imageProviderBianxieLabel", t("providers.bianxie"));
      setText("imageProviderGeminiLabel", t("providers.gemini"));
      setText("imageProviderOpenRouterLabel", t("providers.openrouter"));
      setText("imageProviderCustomLabel", t("providers.custom"));
      setText("imageModelLabel", t("input.image_model_label"));
      setText("imageModelCaption", t("input.image_model_caption"));
      setText("imageModelHint", t("input.image_model_hint"));
      setText("apiKeyLabel", t("input.api_key_label"));
      setText("apiKeyHint", t("input.api_key_hint"));
      setHTML("bianxieRegisterHint", t("input.bianxie_register_hint"));
      setText("baseUrlLabel", t("input.base_url_label"));
      setPlaceholder("baseUrl", CUSTOM_BASE_URL_PLACEHOLDER);
      setText("baseUrlHint", t("input.base_url_hint"));
      setText("imageApiKeyLabel", t("input.image_api_key_label"));
      setPlaceholder("imageApiKey", t("input.image_api_key_placeholder"));
      setText("imageBaseUrlLabel", t("input.image_base_url_label"));
      setPlaceholder("imageBaseUrl", CUSTOM_BASE_URL_PLACEHOLDER);
      setText("optimizeLabel", t("input.optimize_label"));
      setText("imageSizeLabel", t("input.image_size_label"));
      setText("upscaleLabel", t("input.upscale_label"));
      setText("upscaleText", t("input.upscale_text"));
      setText("samBackendLabel", t("input.sam_backend_label"));
      setText("samPromptLabel", t("input.sam_prompt_label"));
      setText("samApiKeyLabel", t("input.sam_api_key_label"));
      setPlaceholder("samApiKey", t("input.sam_api_key_placeholder"));
      setText("referenceImageLabel", t("input.reference_image_label"));
      setText("referenceUploadText", t("input.reference_upload_text"));
      if (!confirmBtn.disabled) {
        confirmBtn.textContent = t("input.confirm_btn");
      }
      if (uploadedReferencePath && referenceStatus) {
        referenceStatus.textContent = t("upload.reference_ready");
      }
      updateRouteSummary();
    }

    onLocaleChange(applyInputLocale);

    if (providerInput) {
      providerInput.addEventListener("change", syncRoutingControls);
    }
    if (imageProviderInput) {
      imageProviderInput.addEventListener("change", syncRoutingControls);
    }
    if (imageModelInput) {
      imageModelInput.addEventListener("change", syncRoutingControls);
    }
    if (svgModelInput) {
      svgModelInput.addEventListener("change", syncRoutingControls);
    }
    if (imageSizeInput) {
      imageSizeInput.addEventListener("change", syncRoutingControls);
    }
    if (samBackend) {
      samBackend.addEventListener("change", syncSamApiKeyVisibility);
      syncSamApiKeyVisibility();
    }
    syncRoutingControls();

    if (uploadZone && referenceFile) {
      uploadZone.addEventListener("click", () => referenceFile.click());
      uploadZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadZone.classList.add("dragging");
      });
      uploadZone.addEventListener("dragleave", () => {
        uploadZone.classList.remove("dragging");
      });
      uploadZone.addEventListener("drop", async (event) => {
        event.preventDefault();
        uploadZone.classList.remove("dragging");
        const file = event.dataTransfer.files[0];
        if (file) {
          const uploadedRef = await uploadReference(
            file,
            confirmBtn,
            referencePreview,
            referenceStatus
          );
          if (uploadedRef) {
            uploadedReferencePath = uploadedRef.path;
            saveInputState();
          }
        }
      });
      referenceFile.addEventListener("change", async () => {
        const file = referenceFile.files[0];
        if (file) {
          const uploadedRef = await uploadReference(
            file,
            confirmBtn,
            referencePreview,
            referenceStatus
          );
          if (uploadedRef) {
            uploadedReferencePath = uploadedRef.path;
            saveInputState();
          }
        }
      });
    }

    const autoSaveFields = [
      $("methodText"),
      providerInput,
      imageProviderInput,
      imageModelInput,
      svgModelInput,
      $("apiKey"),
      baseUrlInput,
      imageApiKeyInput,
      imageBaseUrlInput,
      $("optimizeIterations"),
      $("imageSize"),
      upscaleEnabled,
      samPrompt,
      samApiKeyInput,
    ];
    for (const field of autoSaveFields) {
      if (!field) {
        continue;
      }
      field.addEventListener("input", saveInputState);
      field.addEventListener("change", saveInputState);
    }

    confirmBtn.addEventListener("click", async () => {
      errorMsg.textContent = "";
      const methodText = $("methodText").value.trim();
      if (!methodText) {
        errorMsg.textContent = t("input.error_method_required");
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.textContent = t("input.starting");

      const payload = {
        method_text: methodText,
        optimize_iterations: parseInt($("optimizeIterations").value, 10),
        enable_upscale: upscaleEnabled?.checked ?? true,
        reference_image_path: uploadedReferencePath,
        sam_prompt: $("samPrompt")?.value.trim() || null,
        image_size: imageSizeInput?.value || "4K",
      };
      saveInputState();

      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || t("upload.request_failed"));
        }

        const data = await response.json();
        window.location.href = `/canvas.html?job=${encodeURIComponent(data.job_id)}&source=input`;
      } catch (err) {
        errorMsg.textContent = err.message || t("upload.failed_to_start");
        confirmBtn.disabled = false;
        confirmBtn.textContent = t("input.confirm_btn");
      }
    });
  }

  function initImportPage() {
    const confirmBtn = $("importConfirmBtn");
    const errorMsg = $("importErrorMsg");
    const uploadZone = $("importUploadZone");
    const figureFile = $("importFigureFile");
    const figurePreview = $("importFigurePreview");
    const figureStatus = $("importFigureStatus");
    const providerInput = $("importProvider");
    const providerButtons = $("importProviderButtons");
    const svgModelInput = $("importSvgModel");
    const apiKeyInput = $("importApiKey");
    const bianxieRegisterHint = $("importBianxieRegisterHint");
    const baseUrlGroup = $("importBaseUrlGroup");
    const baseUrlInput = $("importBaseUrl");
    const samBackend = $("importSamBackend");
    const samPrompt = $("importSamPrompt");
    const samApiKeyGroup = $("importSamApiKeyGroup");
    const samApiKeyInput = $("importSamApiKey");
    let uploadedFigurePath = null;

    function getProviderLabel(provider) {
      const normalized = normalizeProviderValue(provider);
      if (normalized === "openai_response") {
        return t("providers.openai_response");
      }
      if (normalized === "openrouter") {
        return t("providers.openrouter");
      }
      if (normalized === "bianxie") {
        return t("providers.bianxie");
      }
      if (normalized === "gemini") {
        return t("providers.gemini");
      }
      return t("providers.custom");
    }

    function loadImportState() {
      try {
        const raw = window.sessionStorage.getItem(IMPORT_STATE_KEY);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (_err) {
        return null;
      }
    }

    function saveImportState() {
      const state = {
        provider: normalizeProviderValue(providerInput?.value ?? "bianxie"),
        svgModel: svgModelInput?.value ?? "",
        apiKey: apiKeyInput?.value ?? "",
        baseUrl: normalizeCustomBaseUrl(baseUrlInput?.value ?? DEFAULT_CUSTOM_BASE_URL),
        samBackend: samBackend?.value ?? "fal",
        samPrompt: samPrompt?.value ?? "icon,person,robot,animal",
        samApiKey: samApiKeyInput?.value ?? "",
        uploadedFigurePath,
        previewUrl: figurePreview?.src ?? "",
        figureStatus: figureStatus?.textContent ?? "",
      };
      try {
        window.sessionStorage.setItem(IMPORT_STATE_KEY, JSON.stringify(state));
      } catch (_err) {
        // Ignore storage failures.
      }
    }

    function applyImportState() {
      const state = loadImportState();
      if (!state) {
        return;
      }
      if (typeof state.provider === "string" && providerInput) {
        providerInput.value = normalizeProviderValue(state.provider);
      }
      if (typeof state.svgModel === "string" && svgModelInput) {
        svgModelInput.value = state.svgModel;
      }
      if (typeof state.apiKey === "string" && apiKeyInput) {
        apiKeyInput.value = state.apiKey;
      }
      if (typeof state.baseUrl === "string" && baseUrlInput) {
        baseUrlInput.value = normalizeCustomBaseUrl(state.baseUrl);
      }
      if (typeof state.samBackend === "string" && samBackend) {
        samBackend.value = state.samBackend;
      }
      if (typeof state.samPrompt === "string" && samPrompt) {
        samPrompt.value = state.samPrompt;
      }
      if (typeof state.samApiKey === "string" && samApiKeyInput) {
        samApiKeyInput.value = state.samApiKey;
      }
      if (typeof state.uploadedFigurePath === "string" && state.uploadedFigurePath) {
        uploadedFigurePath = state.uploadedFigurePath;
      }
      if (typeof state.previewUrl === "string" && state.previewUrl && figurePreview) {
        figurePreview.src = state.previewUrl;
        figurePreview.classList.add("visible");
      }
      if (typeof state.figureStatus === "string" && state.figureStatus && figureStatus) {
        figureStatus.textContent = state.figureStatus;
      }
    }

    function setupChoiceGroup(group, input) {
      if (!group || !input) {
        return;
      }
      const buttons = Array.from(group.querySelectorAll("[data-value]"));

      function applyChoice() {
        const value = input.value;
        for (const button of buttons) {
          const active = button.dataset.value === value;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        }
      }

      for (const button of buttons) {
        button.addEventListener("click", () => {
          input.value = button.dataset.value || "";
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }

      input.addEventListener("change", applyChoice);
      applyChoice();
    }

    function getDefaultSvgModel(provider) {
      provider = normalizeProviderValue(provider);
      if (provider === "openai_response") {
        return "gpt-5.5";
      }
      if (provider === "openrouter") {
        return "google/gemini-3.1-pro-preview";
      }
      return "gemini-3.1-pro-preview";
    }

    function getResolvedImportBaseUrl() {
      return normalizeCustomBaseUrl(baseUrlInput?.value ?? DEFAULT_CUSTOM_BASE_URL);
    }

    function syncProviderDefaults() {
      const provider = normalizeProviderValue(providerInput?.value ?? "bianxie");
      const nextDefault = getDefaultSvgModel(provider);
      const previousDefault = svgModelInput?.dataset.suggestedDefault || "";
      const currentValue = svgModelInput?.value.trim() || "";
      if (svgModelInput) {
        if (!currentValue || currentValue === previousDefault) {
          svgModelInput.value = nextDefault;
        }
        svgModelInput.dataset.suggestedDefault = nextDefault;
        svgModelInput.placeholder = nextDefault;
      }
      if (baseUrlGroup) {
        baseUrlGroup.hidden = provider !== "custom";
      }
      if (bianxieRegisterHint) {
        bianxieRegisterHint.hidden = provider !== "bianxie";
      }
      saveImportState();
    }

    function syncSamApiKeyVisibility() {
      const shouldShow =
        samBackend &&
        (samBackend.value === "fal" ||
          samBackend.value === "roboflow" ||
          samBackend.value === "dashscope");
      if (samApiKeyGroup) {
        samApiKeyGroup.hidden = !shouldShow;
      }
      if (!shouldShow && samApiKeyInput) {
        samApiKeyInput.value = "";
      }
      saveImportState();
    }

    applyImportState();
    setupChoiceGroup(providerButtons, providerInput);

    function applyImportLocale() {
      setText("importBrandTitle", t("importPage.brand"));
      setText("importPageSubtitle", t("importPage.subtitle"));
      setText("importBackLink", t("importPage.back"));
      setText("importGuideBtn", t("input.guide_entry"));
      setText("importHistoryBtn", t("history.nav"));
      setText("importFigureLabel", t("importPage.figure_label"));
      setText("importUploadText", t("importPage.upload_text"));
      setHTML("importFigureHint", t("importPage.figure_hint"));
      setText("importRouteLabel", t("importPage.route_label"));
      setText("importRouteCaption", t("importPage.route_caption"));
      setText("importWorkflowLabel", t("importPage.workflow_label"));
      setText("importWorkflowValue", t("importPage.workflow_value"));
      setText("importStep1Label", t("importPage.step1_label"));
      setText("importStep1Value", t("importPage.step1_value"));
      setText("importRouteNote", t("importPage.route_note"));
      setText("importProviderLabel", t("importPage.provider_label"));
      setText("importProviderCaption", t("importPage.provider_caption"));
      setText("importProviderBianxieTitle", t("providers.bianxie"));
      setText("importProviderBianxieMeta", t("input.provider_bianxie_meta"));
      setText("importProviderGeminiTitle", t("providers.gemini"));
      setText("importProviderGeminiMeta", t("input.provider_gemini_meta"));
      setText("importProviderOpenAIResponsesTitle", t("providers.openai_response"));
      setText("importProviderOpenAIResponsesMeta", t("input.provider_openai_meta"));
      setText("importProviderOpenRouterTitle", t("providers.openrouter"));
      setText("importProviderOpenRouterMeta", t("input.provider_openrouter_meta"));
      setText("importProviderCustomTitle", t("providers.custom"));
      setText("importProviderCustomMeta", t("input.provider_custom_meta"));
      setText("importSvgModelLabel", t("importPage.svg_model_label"));
      setText("importSvgModelHint", t("importPage.svg_model_hint"));
      setText("importApiKeyLabel", t("importPage.api_key_label"));
      setText("importApiKeyHint", t("importPage.api_key_hint"));
      setHTML("importBianxieRegisterHint", t("importPage.bianxie_register_hint"));
      setText("importBaseUrlLabel", t("importPage.base_url_label"));
      setPlaceholder("importBaseUrl", CUSTOM_BASE_URL_PLACEHOLDER);
      setText("importBaseUrlHint", t("importPage.base_url_hint"));
      setText("importSamBackendLabel", t("importPage.sam_backend_label"));
      setText("importSamPromptLabel", t("importPage.sam_prompt_label"));
      setText("importSamApiKeyLabel", t("importPage.sam_api_key_label"));
      setPlaceholder("importSamApiKey", t("importPage.sam_api_key_placeholder"));
      if (!confirmBtn.disabled) {
        confirmBtn.textContent = t("importPage.confirm_btn");
      }
      if (uploadedFigurePath && figureStatus) {
        figureStatus.textContent = t("upload.stage1_ready");
      }
    }

    onLocaleChange(applyImportLocale);

    if (providerInput) {
      providerInput.addEventListener("change", syncProviderDefaults);
    }
    if (samBackend) {
      samBackend.addEventListener("change", syncSamApiKeyVisibility);
    }
    syncProviderDefaults();
    syncSamApiKeyVisibility();

    if (uploadZone && figureFile) {
      uploadZone.addEventListener("click", () => figureFile.click());
      uploadZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadZone.classList.add("dragging");
      });
      uploadZone.addEventListener("dragleave", () => {
        uploadZone.classList.remove("dragging");
      });
      uploadZone.addEventListener("drop", async (event) => {
        event.preventDefault();
        uploadZone.classList.remove("dragging");
        const file = event.dataTransfer.files[0];
        if (file) {
          const uploaded = await uploadReference(file, confirmBtn, figurePreview, figureStatus);
          if (uploaded) {
            uploadedFigurePath = uploaded.path;
            saveImportState();
          }
        }
      });
      figureFile.addEventListener("change", async () => {
        const file = figureFile.files[0];
        if (file) {
          const uploaded = await uploadReference(file, confirmBtn, figurePreview, figureStatus);
          if (uploaded) {
            uploadedFigurePath = uploaded.path;
            saveImportState();
          }
        }
      });
    }

    const autoSaveFields = [svgModelInput, apiKeyInput, baseUrlInput, samBackend, samPrompt, samApiKeyInput];
    for (const field of autoSaveFields) {
      if (!field) {
        continue;
      }
      field.addEventListener("input", saveImportState);
      field.addEventListener("change", saveImportState);
    }

    confirmBtn.addEventListener("click", async () => {
      errorMsg.textContent = "";
      if (!uploadedFigurePath) {
        errorMsg.textContent = t("importPage.error_upload_required");
        return;
      }
      if (!(apiKeyInput?.value.trim() || "")) {
        errorMsg.textContent = t("importPage.error_api_key_required");
        return;
      }
      confirmBtn.disabled = true;
      confirmBtn.textContent = t("importPage.starting");

      const payload = {
        input_figure_path: uploadedFigurePath,
        sam_prompt: samPrompt?.value.trim() || null,
      };
      saveImportState();

      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || t("upload.request_failed"));
        }

        const data = await response.json();
        window.location.href = `/canvas.html?job=${encodeURIComponent(data.job_id)}&source=import`;
      } catch (err) {
        errorMsg.textContent = err.message || t("upload.failed_to_start");
        confirmBtn.disabled = false;
        confirmBtn.textContent = t("importPage.confirm_btn");
      }
    });
  }

  function initGuidePage() {
    function applyGuideLocale() {
      setText("guideBrandTitle", t("guide.brand"));
      setText("guideSubtitle", t("guide.subtitle"));
      setText("guideBackInputBtn", t("guide.back_input"));
      setText("guideBackImportBtn", t("guide.back_import"));
      setText("guideHistoryBtn", t("history.nav"));
      setText("guideOverviewTitle", t("guide.overview_title"));
      setText("guideOverviewCopy", t("guide.overview_copy"));
      setText("guideMethodKicker", t("guide.method_kicker"));
      setText("guideMethodTitle", t("guide.method_title"));
      setText("guideMethodCopy", t("guide.method_copy"));
      setText("guideImportKicker", t("guide.import_kicker"));
      setText("guideImportTitle", t("guide.import_title"));
      setText("guideImportCopy", t("guide.import_copy"));
      setText("guidePresetsTitle", t("guide.presets_title"));
      setText("guidePreset1Title", t("guide.preset1_title"));
      setText("guidePreset1Copy", t("guide.preset1_copy"));
      setText("guidePreset2Title", t("guide.preset2_title"));
      setText("guidePreset2Copy", t("guide.preset2_copy"));
      setText("guidePreset3Title", t("guide.preset3_title"));
      setText("guidePreset3Copy", t("guide.preset3_copy"));
      setText("guidePipelineStepsTitle", t("guide.pipeline_steps_title"));
      setText("guideStep1Kicker", t("guide.step1_kicker"));
      setText("guideStep1Title", t("guide.step1_title"));
      setText("guideStep1Copy", t("guide.step1_copy"));
      setText("guideStep2Kicker", t("guide.step2_kicker"));
      setText("guideStep2Title", t("guide.step2_title"));
      setText("guideStep2Copy", t("guide.step2_copy"));
      setText("guideStep3Kicker", t("guide.step3_kicker"));
      setText("guideStep3Title", t("guide.step3_title"));
      setText("guideStep3Copy", t("guide.step3_copy"));
      setText("guideStep4Kicker", t("guide.step4_kicker"));
      setText("guideStep4Title", t("guide.step4_title"));
      setText("guideStep4Copy", t("guide.step4_copy"));
      setText("guideStep5Kicker", t("guide.step5_kicker"));
      setText("guideStep5Title", t("guide.step5_title"));
      setText("guideStep5Copy", t("guide.step5_copy"));
      setText("guideMainStepsTitle", t("guide.main_steps_title"));
      setText("guideMainStep1Title", t("guide.main_step1_title"));
      setText("guideMainStep1Copy", t("guide.main_step1_copy"));
      setText("guideMainStep2Title", t("guide.main_step2_title"));
      setText("guideMainStep2Copy", t("guide.main_step2_copy"));
      setText("guideMainStep3Title", t("guide.main_step3_title"));
      setText("guideMainStep3Copy", t("guide.main_step3_copy"));
      setText("guideMainStep4Title", t("guide.main_step4_title"));
      setText("guideMainStep4Copy", t("guide.main_step4_copy"));
      setText("guideMainStep5Title", t("guide.main_step5_title"));
      setText("guideMainStep5Copy", t("guide.main_step5_copy"));
      setText("guideImportStepsTitle", t("guide.import_steps_title"));
      setText("guideImportStep1Title", t("guide.import_step1_title"));
      setText("guideImportStep1Copy", t("guide.import_step1_copy"));
      setText("guideImportStep2Title", t("guide.import_step2_title"));
      setText("guideImportStep2Copy", t("guide.import_step2_copy"));
      setText("guideImportStep3Title", t("guide.import_step3_title"));
      setText("guideImportStep3Copy", t("guide.import_step3_copy"));
      setText("guideImportStep4Title", t("guide.import_step4_title"));
      setText("guideImportStep4Copy", t("guide.import_step4_copy"));
      setText("guideFieldsTitle", t("guide.fields_title"));
      setText("guideFieldMethodTitle", t("guide.field_method_title"));
      setText("guideFieldMethodCopy", t("guide.field_method_copy"));
      setText("guideFieldProviderTitle", t("guide.field_provider_title"));
      setText("guideFieldProviderCopy", t("guide.field_provider_copy"));
      setText("guideFieldImageProviderTitle", t("guide.field_image_provider_title"));
      setText("guideFieldImageProviderCopy", t("guide.field_image_provider_copy"));
      setText("guideFieldCustomUrlTitle", t("guide.field_custom_url_title"));
      setText("guideFieldCustomUrlCopy", t("guide.field_custom_url_copy"));
      setText("guideFieldImageModelTitle", t("guide.field_image_model_title"));
      setText("guideFieldImageModelCopy", t("guide.field_image_model_copy"));
      setText("guideFieldSvgModelTitle", t("guide.field_svg_model_title"));
      setText("guideFieldSvgModelCopy", t("guide.field_svg_model_copy"));
      setText("guideFieldUpscaleTitle", t("guide.field_upscale_title"));
      setText("guideFieldUpscaleCopy", t("guide.field_upscale_copy"));
      setText("guideFieldSamTitle", t("guide.field_sam_title"));
      setText("guideFieldSamCopy", t("guide.field_sam_copy"));
      setText("guideSamTitle", t("guide.sam_title"));
      setText("guideSamLocalTitle", t("guide.sam_local_title"));
      setText("guideSamLocalCopy", t("guide.sam_local_copy"));
      setText("guideSamFalTitle", t("guide.sam_fal_title"));
      setText("guideSamFalCopy", t("guide.sam_fal_copy"));
      setText("guideSamRoboflowTitle", t("guide.sam_roboflow_title"));
      setText("guideSamRoboflowCopy", t("guide.sam_roboflow_copy"));
      setText("guideSamPromptTitle", t("guide.sam_prompt_title"));
      setText("guideSamPromptCopy", t("guide.sam_prompt_copy"));
      setText("guideSamWhenTitle", t("guide.sam_when_title"));
      setText("guideSamWhenCopy", t("guide.sam_when_copy"));
      setText("guideSamKeyTitle", t("guide.sam_key_title"));
      setText("guideSamKeyCopy", t("guide.sam_key_copy"));
      setText("guideExamplesTitle", t("guide.examples_title"));
      setText("guideExample1Title", t("guide.example1_title"));
      setText("guideExample1Copy", t("guide.example1_copy"));
      setText("guideExample2Title", t("guide.example2_title"));
      setText("guideExample2Copy", t("guide.example2_copy"));
      setText("guideExample3Title", t("guide.example3_title"));
      setText("guideExample3Copy", t("guide.example3_copy"));
      setText("guideHelpBadge", t("guide.help_badge"));
      setText("guideHelpTitle", t("guide.help_title"));
      setText("guideHelpCopy", t("guide.help_copy"));
      setText("guideHelpButtonText", t("guide.help_button"));
    }

    onLocaleChange(applyGuideLocale);
  }

  function initHistoryPage() {
    const grid = $("historyGrid");
    const empty = $("historyEmpty");
    const countEl = $("historyCount");
    const refreshBtn = $("historyRefreshBtn");
    let historyItems = [];
    let isLoading = false;

    function applyHistoryLocale() {
      setText("historyBrandTitle", t("history.brand"));
      setText("historySubtitle", t("history.subtitle"));
      setText("historyBackInputBtn", t("history.back_input"));
      setText("historyBackImportBtn", t("history.back_import"));
      setText("historyRefreshBtn", isLoading ? t("history.loading") : t("history.refresh"));
      setText("historySummaryTitle", t("history.summary_title"));
      setText("historyEmptyTitle", t("history.empty_title"));
      setText("historyEmptyBody", t("history.empty_body"));
      renderHistoryItems();
    }

    async function loadHistory() {
      if (isLoading) {
        return;
      }
      isLoading = true;
      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = t("history.loading");
      }
      try {
        const response = await fetch("/api/history");
        if (!response.ok) {
          throw new Error("History request failed");
        }
        const data = await response.json();
        historyItems = Array.isArray(data.items) ? data.items : [];
      } catch (_err) {
        historyItems = [];
      } finally {
        isLoading = false;
        if (refreshBtn) {
          refreshBtn.disabled = false;
          refreshBtn.textContent = t("history.refresh");
        }
        renderHistoryItems();
      }
    }

    function renderHistoryItems() {
      if (!grid || !countEl || !empty) {
        return;
      }
      countEl.textContent = t("history.count", { count: historyItems.length });
      grid.textContent = "";
      empty.hidden = historyItems.length > 0;

      for (const item of historyItems) {
        grid.appendChild(createHistoryCard(item));
      }
    }

    function createHistoryCard(item) {
      const card = document.createElement("a");
      card.className = "history-card";
      card.href = item.open_url || `/canvas.html?job=${encodeURIComponent(item.job_id)}&source=history`;

      const media = document.createElement("div");
      media.className = "history-card-media";
      const img = document.createElement("img");
      img.src = item.thumbnail_url || "";
      img.alt = item.job_id || "";
      img.loading = "lazy";
      media.appendChild(img);

      const body = document.createElement("div");
      body.className = "history-card-body";

      const topRow = document.createElement("div");
      topRow.className = "history-card-top";

      const title = document.createElement("div");
      title.className = "history-card-title";
      title.textContent = item.job_id || "unknown";

      const status = document.createElement("div");
      status.className = `history-status ${item.status === "complete" ? "complete" : "partial"}`;
      status.textContent = item.status === "complete" ? t("history.complete") : t("history.partial");

      topRow.appendChild(title);
      topRow.appendChild(status);

      const meta = document.createElement("div");
      meta.className = "history-card-meta";
      meta.textContent = t("history.artifacts", { count: item.artifact_count || 0 });

      const updated = document.createElement("div");
      updated.className = "history-card-updated";
      updated.textContent = t("history.updated", { time: formatHistoryTime(item.updated_at) });

      const cta = document.createElement("div");
      cta.className = "history-card-action";
      cta.textContent = t("history.open");

      body.appendChild(topRow);
      body.appendChild(meta);
      body.appendChild(updated);
      body.appendChild(cta);
      card.appendChild(media);
      card.appendChild(body);
      return card;
    }

    function formatHistoryTime(value) {
      if (!value) {
        return t("history.unknown_time");
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return t("history.unknown_time");
      }
      return new Intl.DateTimeFormat(currentLocale === "zh" ? "zh-CN" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", loadHistory);
    }
    onLocaleChange(applyHistoryLocale);
    loadHistory();
  }

  async function uploadReference(file, confirmBtn, previewEl, statusEl) {
    if (!file.type.startsWith("image/")) {
      statusEl.textContent = t("upload.only_images");
      return null;
    }

    confirmBtn.disabled = true;
    statusEl.textContent = t("upload.uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      const data = await response.json();
      const isImport = statusEl?.id === "importFigureStatus";
      statusEl.textContent = t(
        isImport ? "upload.uploaded_stage1" : "upload.uploaded_reference",
        { name: data.name }
      );
      if (previewEl) {
        previewEl.src = data.url || "";
        previewEl.classList.add("visible");
      }
      return {
        path: data.path || null,
        url: data.url || "",
        name: data.name || "",
      };
    } catch (err) {
      statusEl.textContent = err.message || t("upload.upload_failed");
      return null;
    } finally {
      confirmBtn.disabled = false;
    }
  }

  async function initCanvasPage() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("job");
    const source = params.get("source");
    const statusText = $("statusText");
    const jobIdEl = $("jobId");
    const artifactPanel = $("artifactPanel");
    const artifactList = $("artifactList");
    const toggle = $("artifactToggle");
    const logToggle = $("logToggle");
    const backToConfigBtn = $("backToConfigBtn");
    const logPanel = $("logPanel");
    const logBody = $("logBody");
    const iframe = $("svgEditorFrame");
    const fallback = $("svgFallback");
    const fallbackObject = $("fallbackObject");
    let currentStep = 0;
    let isFinished = false;
    let statusState = "waiting";
    let fallbackMode = "editor";

    if (!jobId) {
      statusText.textContent = t("canvas.missing_job");
      return;
    }

    function setCanvasLocale() {
      setText("canvasBrandTitle", t("canvas.brand"));
      setText("canvasStatusLabel", t("canvas.status_label"));
      setText("canvasJobLabel", t("canvas.job"));
      setText(
        "fallbackTitle",
        fallbackMode === "history_image"
          ? t("canvas.image_preview_title")
          : t("canvas.fallback_title")
      );
      setHTML(
        "fallbackBody",
        fallbackMode === "history_image"
          ? t("canvas.image_preview_body")
          : t("canvas.fallback_body")
      );
      setText("artifactPanelTitle", t("canvas.artifacts"));
      setText("logPanelTitle", t("canvas.logs"));
      setText("logToggle", t("canvas.logs"));
      setText("canvasHistoryBtn", t("history.nav"));
      if (backToConfigBtn) {
        if (source === "history") {
          backToConfigBtn.textContent = t("canvas.back_history");
        } else {
          backToConfigBtn.textContent =
            source === "import" ? t("canvas.back_import") : t("canvas.back_config");
        }
      }
      if (statusState === "waiting") {
        statusText.textContent = t("canvas.waiting");
      } else if (statusState === "running") {
        statusText.textContent = currentLocale === "zh" ? "运行中" : "Running";
      } else if (statusState === "disconnected") {
        statusText.textContent = currentLocale === "zh" ? "连接断开" : "Disconnected";
      } else if (statusState === "done") {
        statusText.textContent = currentLocale === "zh" ? "完成" : "Done";
      } else if (statusState === "history") {
        statusText.textContent = t("canvas.history_ready");
      }
    }

    onLocaleChange(setCanvasLocale);

    jobIdEl.textContent = jobId;

    toggle.addEventListener("click", () => {
      artifactPanel.classList.toggle("open");
    });

    logToggle.addEventListener("click", () => {
      logPanel.classList.toggle("open");
    });
    if (backToConfigBtn) {
      backToConfigBtn.addEventListener("click", () => {
        if (source === "history") {
          window.location.href = "/history.html";
        } else {
          window.location.href = source === "import" ? "/import.html" : "/";
        }
      });
    }

    let svgEditAvailable = false;
    let svgEditPath = null;
    try {
      const configRes = await fetch("/api/config");
      if (configRes.ok) {
        const config = await configRes.json();
        svgEditAvailable = Boolean(config.svgEditAvailable);
        svgEditPath = config.svgEditPath || null;
      }
    } catch (err) {
      svgEditAvailable = false;
    }

    if (svgEditAvailable && svgEditPath) {
      iframe.src = svgEditPath;
    } else {
      fallback.classList.add("active");
      iframe.style.display = "none";
    }

    let svgReady = false;
    let pendingSvgText = null;

    iframe.addEventListener("load", () => {
      svgReady = true;
      if (pendingSvgText) {
        tryLoadSvg(pendingSvgText);
        pendingSvgText = null;
      }
    });

    const stepMap = {
      figure: { step: 1, labelKey: "canvas.steps.figure" },
      samed: { step: 2, labelKey: "canvas.steps.samed" },
      icon_raw: { step: 3, labelKey: "canvas.steps.icon_raw" },
      icon_nobg: { step: 3, labelKey: "canvas.steps.icon_nobg" },
      template_svg: { step: 4, labelKey: "canvas.steps.template_svg" },
      optimized_template_svg: { step: 4, labelKey: "canvas.steps.optimized_template_svg" },
      final_svg: { step: 5, labelKey: "canvas.steps.final_svg" },
    };

    const artifacts = new Set();
    if (source === "history") {
      await loadHistoricalJob(false);
      return;
    }

    const eventSource = new EventSource(`/api/events/${jobId}`);

    eventSource.addEventListener("artifact", async (event) => {
      const data = JSON.parse(event.data);
      rememberArtifact(data);

      if (
        data.kind === "template_svg" ||
        data.kind === "optimized_template_svg" ||
        data.kind === "final_svg"
      ) {
        await loadSvgAsset(data.url);
      }

      if (stepMap[data.kind] && stepMap[data.kind].step > currentStep) {
        currentStep = stepMap[data.kind].step;
        statusText.textContent = `Step ${currentStep}/5 - ${t(stepMap[data.kind].labelKey)}`;
      }
    });

    eventSource.addEventListener("status", (event) => {
      const data = JSON.parse(event.data);
      if (data.state === "started") {
        statusState = "running";
        statusText.textContent = currentLocale === "zh" ? "运行中" : "Running";
      } else if (data.state === "finished") {
        isFinished = true;
        if (typeof data.code === "number" && data.code !== 0) {
          statusState = "failed";
          statusText.textContent =
            currentLocale === "zh" ? `失败（code ${data.code}）` : `Failed (code ${data.code})`;
        } else {
          statusState = "done";
          statusText.textContent = currentLocale === "zh" ? "完成" : "Done";
        }
      }
    });

    eventSource.addEventListener("log", (event) => {
      const data = JSON.parse(event.data);
      appendLogLine(logBody, data);
    });

    let historyFallbackAttempted = false;
    eventSource.onerror = async () => {
      if (isFinished) {
        eventSource.close();
        return;
      }
      if (!historyFallbackAttempted) {
        historyFallbackAttempted = true;
        const loaded = await loadHistoricalJob(true);
        if (loaded) {
          eventSource.close();
          return;
        }
      }
      statusState = "disconnected";
      statusText.textContent = currentLocale === "zh" ? "连接断开" : "Disconnected";
    };

    function rememberArtifact(data, prepend = true) {
      if (!data || !data.path || artifacts.has(data.path)) {
        return;
      }
      artifacts.add(data.path);
      addArtifactCard(artifactList, data, { prepend });
    }

    async function loadHistoricalJob(silent) {
      try {
        const response = await fetch(`/api/history/${encodeURIComponent(jobId)}`);
        if (!response.ok) {
          throw new Error("History job not found");
        }
        const item = await response.json();
        const historicalArtifacts = Array.isArray(item.artifacts) ? item.artifacts : [];
        for (const artifact of historicalArtifacts) {
          rememberArtifact(artifact, false);
        }

        const svgArtifact = findFirstArtifact(historicalArtifacts, [
          "final_svg",
          "optimized_template_svg",
          "template_svg",
        ]);
        const imageArtifact = findFirstArtifact(historicalArtifacts, ["figure", "samed"]);
        if (svgArtifact) {
          await loadSvgAsset(svgArtifact.url);
        } else if (imageArtifact) {
          loadImageAsset(imageArtifact);
        }
        statusState = "history";
        statusText.textContent = t("canvas.history_ready");
        return true;
      } catch (_err) {
        if (!silent) {
          statusState = "disconnected";
          statusText.textContent = t("canvas.history_not_found");
        }
        return false;
      }
    }

    function findFirstArtifact(items, kinds) {
      for (const kind of kinds) {
        const found = items.find((item) => item.kind === kind);
        if (found) {
          return found;
        }
      }
      return null;
    }

    async function loadSvgAsset(url) {
      let svgText = "";
      try {
        const response = await fetch(url);
        svgText = await response.text();
      } catch (err) {
        return;
      }

      if (svgEditAvailable) {
        if (!svgEditPath) {
          return;
        }
        if (!svgReady) {
          pendingSvgText = svgText;
          return;
        }

        const loaded = tryLoadSvg(svgText);
        if (!loaded) {
          iframe.src = `${svgEditPath}?url=${encodeURIComponent(url)}`;
        }
      } else {
        fallbackObject.data = url;
      }
    }

    function loadImageAsset(artifact) {
      fallbackMode = "history_image";
      iframe.style.display = "none";
      fallback.classList.add("active");
      fallbackObject.data = artifact.url;
      setCanvasLocale();
    }

    function tryLoadSvg(svgText) {
      if (!iframe.contentWindow) {
        return false;
      }

      const win = iframe.contentWindow;
      if (win.svgEditor && typeof win.svgEditor.loadFromString === "function") {
        win.svgEditor.loadFromString(svgText);
        return true;
      }
      if (win.svgCanvas && typeof win.svgCanvas.setSvgString === "function") {
        win.svgCanvas.setSvgString(svgText);
        return true;
      }
      return false;
    }
  }

  function appendLogLine(container, data) {
    const line = `[${data.stream}] ${data.line}`;
    const lines = container.textContent.split("\n").filter(Boolean);
    lines.push(line);
    if (lines.length > 200) {
      lines.splice(0, lines.length - 200);
    }
    container.textContent = lines.join("\n");
    container.scrollTop = container.scrollHeight;
  }

  function addArtifactCard(container, data, options = {}) {
    const prepend = options.prepend !== false;
    const card = document.createElement("a");
    card.className = "artifact-card";
    card.href = data.url;
    card.target = "_blank";
    card.rel = "noreferrer";

    let media;
    if (isPreviewableArtifact(data.kind)) {
      media = document.createElement("img");
      media.src = data.url;
      media.alt = data.name;
      media.loading = "lazy";
    } else {
      media = document.createElement("div");
      media.className = "artifact-file-icon";
      media.textContent = data.kind === "log" ? "LOG" : "JSON";
    }

    const meta = document.createElement("div");
    meta.className = "artifact-meta";

    const name = document.createElement("div");
    name.className = "artifact-name";
    name.textContent = data.name;

    const badge = document.createElement("div");
    badge.className = "artifact-badge";
    badge.textContent = formatKind(data.kind);

    meta.appendChild(name);
    meta.appendChild(badge);
    card.appendChild(media);
    card.appendChild(meta);
    if (prepend) {
      container.prepend(card);
    } else {
      container.appendChild(card);
    }
  }

  function isPreviewableArtifact(kind) {
    return [
      "figure",
      "samed",
      "icon_raw",
      "icon_nobg",
      "template_svg",
      "optimized_template_svg",
      "final_svg",
    ].includes(kind);
  }

  function formatKind(kind) {
    switch (kind) {
      case "figure":
        return currentLocale === "zh" ? "原图" : "figure";
      case "samed":
        return currentLocale === "zh" ? "分割标注" : "samed";
      case "icon_raw":
        return currentLocale === "zh" ? "原始图标" : "icon raw";
      case "icon_nobg":
        return currentLocale === "zh" ? "去背景图标" : "icon no-bg";
      case "template_svg":
        return currentLocale === "zh" ? "模板 SVG" : "template";
      case "optimized_template_svg":
        return currentLocale === "zh" ? "优化模板" : "optimized";
      case "final_svg":
        return currentLocale === "zh" ? "最终 SVG" : "final";
      case "boxlib":
        return currentLocale === "zh" ? "坐标数据" : "box data";
      case "log":
        return currentLocale === "zh" ? "日志" : "log";
      default:
        return currentLocale === "zh" ? "素材" : "artifact";
    }
  }
})();
