# Citation And Attribution

This page explains how we hope people cite and acknowledge AutoFigure-Edit.

This document is intentionally gentle:

- it is a request for fair academic attribution
- it is not an extra restriction added to the software license
- it is not legal advice

## Short version

If AutoFigure-Edit materially helps a paper, report, benchmark write-up, demo, or public figure artifact, please:

1. cite the AutoFigure-Edit paper
2. disclose meaningful AI assistance honestly
3. avoid presenting AI-generated or AI-edited figures as fully manual if that would mislead readers

If you only used AutoFigure-Edit in a minor operational way, such as launching the server, checking the repository layout, or testing a local setup, citation is usually not necessary.

## When we strongly encourage citation

Citation is strongly encouraged when AutoFigure-Edit materially contributes to work such as:

- turning method text into editable SVG figures
- drafting or refining figures that appear in a paper, report, blog post, poster, or slide deck
- AI-assisted figure editing, assembly, or iterative visual revision
- public demos, case studies, or benchmarks that materially depend on AutoFigure-Edit outputs

The practical rule is simple:

- if AutoFigure-Edit changed the substance, speed, or shape of the published figure or research artifact in a meaningful way, please cite it

## When citation is usually not necessary

Citation is usually unnecessary when AutoFigure-Edit was used only as:

- a local launcher
- a setup or deployment convenience
- a one-off operational helper without material contribution to the figure or research output

## Preferred citation

Paper link:

- `https://arxiv.org/abs/2603.06674`

BibTeX:

```bibtex
@misc{lin2026autofigureeditgeneratingeditablescientific,
  title={AutoFigure-Edit: Generating Editable Scientific Illustration},
  author={Zhen Lin and Qiujie Xie and Minjun Zhu and Shichen Li and Qiyao Sun and Enhao Gu and Yiran Ding and Ke Sun and Fang Guo and Panzhong Lu and Zhiyuan Ning and Yixuan Weng and Yue Zhang},
  year={2026},
  eprint={2603.06674},
  archivePrefix={arXiv},
  primaryClass={cs.CV},
  url={https://arxiv.org/abs/2603.06674}
}
```

## Suggested acknowledgment text

If AutoFigure-Edit materially assisted the project, a short acknowledgment like the following is usually enough:

```text
We used AutoFigure-Edit to assist parts of the figure-generation and figure-editing workflow, including selected SVG drafting, structured refinement, and/or assembly of scientific illustrations. Final scientific claims, reported results, and publication decisions remain the responsibility of the human authors.
```

You can shorten or adapt this wording to match venue norms.

## AI assistance disclosure

We strongly encourage clear disclosure when AutoFigure-Edit contributed to:

- figure generation
- SVG drafting or reconstruction
- figure editing or assembly
- prompt iteration for published visuals

The disclosure does not need to overstate use.
It should simply help readers understand where meaningful AI assistance existed.

## Not a license condition

This citation guidance does not change the repository software license.

In particular:

- it is not a new license condition
- it does not terminate your software rights if you forget to cite
- it is a community and academic attribution request, not a software-usage gate

## Related files

- [CITATION.cff](./CITATION.cff)
- [TRADEMARK.md](./TRADEMARK.md)
- [README.md](./README.md)
