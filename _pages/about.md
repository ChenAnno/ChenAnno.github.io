---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# 👨🏻‍🎓 Biography

I am currently a Second-year Ph.D. student at the [Show Lab](https://sites.google.com/view/showlab/home), <span style="color: #E67C46;">National University of Singapore</span>, advised by [Prof. Mike Zheng Shou](https://scholar.google.com/citations?user=h1-3lSoAAAAJ&hl=zh-CN).

I obtained my Master of Science degree from the [AAIS](http://www.aais.pku.edu.cn/) at <span style="color: #A62B24;">Peking University</span>, advised by [Prof. Yuxin Peng](http://39.108.48.32/mipl/pengyuxin/). 

Previously, I have interned at TikTok and Kuaishou.

My research interests include **Agent**, **Robotics**, and **Multimedia**.

I’m open to collaborations and discussions. Feel free to drop me an [email](mailto:chenyanzhe@u.nus.edu)~


<span class='anchor' id='news'></span>

# 🔥 News

<div class="news-card" data-show="10" markdown="1">

- `Sep. 2026` 🦾 We released <span class="show-S">S</span><span class="show-h">h</span><span class="show-o">o</span><span class="show-w">w</span>-Harness [[Website](https://showlab.github.io/Show-Harness/), [Code](https://github.com/showlab/Show-Harness)], and a [Survey](https://showlab.github.io/Awesome-Multimodal-Embodied-Agent/) on robot-use agent.
- `Sep. 2026` 🎉 Three papers got accepted by **CoRL 2026**.
- `May 2026` 🎉 [Code2Video](https://showlab.github.io/Code2Video/) and [ACA](https://arxiv.org/abs/2605.07381) got accepted by **ICML 2026**.
- `Jan. 2026` 🎉 We won the third place in [RoCo Challenge](https://rocochallenge.github.io/RoCo2026/) @AAAI Embodied AI Workshop 2026.
- `Nov. 2025` 🎉 [UniAPO](https://arxiv.org/abs/2508.17890) got accepted by **AAAI 2026**.
- `Aug. 2025` 🎓 Joined [Show Lab @ NUS](https://sites.google.com/view/showlab/home) to start my Ph.D. journey!

</div>

<span class='anchor' id='publications'></span>

# 📝 Publications

## ⭐ Selected Publications

<div class="pub-card">
  <div class="pub-thumb">
    <video class="lazy-video" src="images/show-harness.mp4" poster="images/show-harness-poster.jpg" preload="none" muted loop playsinline controls></video>
  </div>
  <div class="pub-info">
    <h3 class="pub-title"><span class="show-S">S</span><span class="show-h">h</span><span class="show-o">o</span><span class="show-w">w</span>-Harness: Just a VLM Agent Can Play Robots</h3>
    <p class="authors"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zechen Bai<sup>*</sup>, Zhijun Cao<sup>*</sup>, Wenzheng Zeng<sup>*</sup>, Kevin Qinghong Lin, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Qiming Huang, Mike Zheng Shou</p>
    <p class="venue preprint">arXiv 2026</p>
    <p class="pub-summary">Show-Harness is an embodied harness that lets <mark>VLMs <em>play</em> robots</mark> through a <mark>compact semantic action interface</mark>.</p>
    <p class="pub-links"><a href="https://showlab.github.io/Show-Harness/">Project</a> <a href="https://arxiv.org/abs/2609.10522">Paper</a> <a href="https://github.com/showlab/Show-Harness" data-gh-stars="showlab/Show-Harness">Code</a> <a href="https://huggingface.co/showlab/Show-Harness-VLMs">Models</a> <a href="https://huggingface.co/datasets/showlab/Show-Harness-Data">Dataset</a></p>
  </div>
</div>

<div class="pub-card">
  <div class="pub-thumb">
    <video class="lazy-video" src="images/code2video.mp4" poster="images/code2video-poster.jpg" preload="none" muted loop playsinline controls></video>
  </div>
  <div class="pub-info">
    <h3 class="pub-title">Code2Video: A Code-centric Paradigm for Educational Video Generation</h3>
    <p class="authors"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Kevin Qinghong Lin<sup>*</sup>, Mike Zheng Shou</p>
    <p class="venue">ICML 2026</p>
    <p class="pub-summary">Code2Video is an <mark>agentic, code-centric framework</mark> that generates <mark>high-quality educational videos</mark> from tutorial topics.</p>
    <p class="pub-links"><a href="https://showlab.github.io/Code2Video/">Project</a> <a href="https://arxiv.org/abs/2510.01174">Paper</a> <a href="https://github.com/showlab/Code2Video" data-gh-stars="showlab/Code2Video">Code</a> <a href="https://huggingface.co/datasets/YanzheChen/MMMC">Dataset</a></p>
  </div>
</div>

## 📚 All Publications

<div class="pub-tabs" markdown="1">

### First & Co-first<span class="wide-only"> Author</span>

<div class="pub-list" markdown="1">

- {: data-topics="agent multimedia"} **Code2Video: A Code-centric Paradigm for Educational Video Generation** <br> <span class="authors"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Kevin Qinghong Lin<sup>*</sup>, Mike Zheng Shou</span> <br> <span class="venue">ICML 2026</span> [Paper](https://arxiv.org/abs/2510.01174)
- {: data-topics="robotics"} **Escaping the Diversity Trap in Robotic Manipulation via Anchor-Centric Adaptation** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Kevin Yuchen Ma, Qi Lv, Yiqi Lin, Zechen Bai, Chen Gao, Mike Zheng Shou</span> <br> <span class="venue">ICML 2026</span> [Paper](https://arxiv.org/pdf/2605.07381)
- {: data-topics="robotics"} **Where Success Breaks: Failure-Boundary Learning for Robust Vision-Language-Action Models** <br> <span class="authors"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zhijun Cao<sup>*</sup>, Mike Zheng Shou</span> <br> <span class="venue">CoRL 2026</span> [Paper](https://arxiv.org/abs/2609.06114)
- {: data-topics="multimedia"} **UniAPO: Unified Multimodal Automated Prompt Optimization** <br> <span class="authors">Qipeng Zhu<sup>*</sup>, <u><b>Yanzhe Chen</b></u><sup>*</sup>, Huasong Zhong<sup>*</sup>, Jie Chen, Yan Li, Zhixin Zhang, Junping Zhang, Zhenheng Yang</span> <br> <span class="venue">AAAI 2026</span> [Paper](https://ojs.aaai.org/index.php/AAAI/article/view/40151)
- {: data-topics="agent robotics"} **Show-Harness: Just a VLM Agent Can Play Robots** <br> <span class="authors"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zechen Bai<sup>*</sup>, Zhijun Cao<sup>*</sup>, Wenzheng Zeng<sup>*</sup>, Kevin Qinghong Lin, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Qiming Huang, Mike Zheng Shou</span> <br> <span class="venue preprint">arXiv 2026</span> [Paper](https://arxiv.org/abs/2609.10522)
- {: data-topics="agent robotics"} **Survey on Multimodal Embodied Agents: A Unified Capability-centric Perspective from Computer-Use to Robot-Use** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Ziyi Yang, Jifeng Zhu, Qiming Huang, Ruihe An, Peiyao Xu, Hesen Yang, Runda Liu, Chang Gong, Zhijun Cao, Zechen Bai, Wenzheng Zeng, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Kevin Qinghong Lin, Mike Zheng Shou</span> <br> <span class="venue preprint">TechRxiv 2026</span> [Paper](https://doi.org/10.6084/m9.figshare.33529048)
- {: data-topics="robotics"} **ActionMap: Robot Policy Learning via Voxel Action Heatmap** <br> <span class="authors">Pei Yang<sup>*</sup>, Hai Ci<sup>*</sup>, <u><b>Yanzhe Chen</b></u><sup>*</sup>, Qi Lv, Han Cai, Mike Zheng Shou</span> <br> <span class="venue preprint">arXiv 2026</span> [Paper](https://arxiv.org/pdf/2606.06904)
- {: data-topics="multimedia"} **MAI: A Multi-turn Aggregation-Iteration Model for Composed Image Retrieval** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Zhiwen Yang, Jinglin Xu, Yuxin Peng</span> <br> <span class="venue">ICLR 2025</span> [Paper](https://openreview.net/pdf?id=gXyWbl71n1)
- {: data-topics="multimedia"} **UniCode²: Cascaded Large-scale Codebooks for Unified Multimodal Understanding and Generation** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Yan Li, Zhenheng Yang</span> <br> <span class="venue preprint">Technical Report 2025</span> [Paper](https://arxiv.org/abs/2506.20214)
- {: data-topics="multimedia"} **FashionERN: Enhance-and-Refine Network for Composed Fashion Image Retrieval** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Jiahuan Zhou, Lele Cheng</span> <br> <span class="venue">AAAI 2024</span> [Paper](https://ojs.aaai.org/index.php/AAAI/article/view/27885/27795)
- {: data-topics="multimedia"} **SPIRIT: Style-guided Patch Interaction for Fashion Image Retrieval with Text Feedback** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Jiahuan Zhou, Yuxin Peng</span> <br> <span class="venue">TOMM 2024</span> [Paper](https://dl.acm.org/doi/10.1145/3640345)
- {: data-topics="multimedia"} **Real20M: A Large-scale E-commerce Dataset for Cross-domain Retrieval** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Lele Cheng</span> <br> <span class="venue">ACM MM 2023</span> [Paper](https://dl.acm.org/doi/abs/10.1145/3581783.3612408)
- {: data-topics="multimedia"} **PKU_WICT at TRECVID 2022: Disaster Scene Description and Indexing Task** <br> <span class="authors"><u><b>Yanzhe Chen</b></u>, HsiaoYuan Hsu, James Ye, Zhiwen Yang, Zishuo Wang, Xiangteng He, Yuxin Peng</span> <br> <span class="venue">TRECVID 2022</span> <span class="award">· Ranked 1st</span> [Paper](https://www-nlpir.nist.gov/projects/tvpubs/tv22.papers/pku_wict.pdf)

</div>

### Collaborations

<div class="pub-list" markdown="1">

- {: data-topics="robotics"} **Supervise What Survives: Geometry-Guided VLA Adaptation from Synthetic Robot Videos** <br> <span class="authors">Danze Chen, <u><b>Yanzhe Chen</b></u>, Qiming Huang, Zhijun Cao, Chen Gao, Mike Zheng Shou</span> <br> <span class="venue">CoRL 2026</span> [Paper](https://arxiv.org/pdf/2606.24448)
- **Overconfidence in LLM-as-a-Judge: Diagnosis and Confidence-Driven Solution** <br> <span class="authors">Zailong Tian, Zhuoheng Han, <u><b>Yanzhe Chen</b></u>, Haozhe Xu, Xi Yang, Richeng Xuan, Houfeng Wang, Lizi Liao</span> <br> <span class="venue">NLPCC 2026</span> [Paper](https://arxiv.org/abs/2508.06225)
- {: data-topics="agent"} **PaperDoctor: Evidence-Grounded and Actionable Feedback for Scientific Papers in Progress** <br> <span class="authors">Kevin Qinghong Lin, Siyuan Hu, Pan Lu, Yu Chen, <u><b>Yanzhe Chen</b></u>, Owen Queen, Yupeng Chen, Jialin Yu, Junchi Yu, Zifeng Ding, Yuanfeng Ji, Sheng Liu, Jindong Gu, Linjie Li, Mike Zheng Shou, Philip Torr, James Zou</span> <br> <span class="venue">ICMLW AI4S 2026</span> <span class="award">· Best Poster Award</span> [Paper](https://openreview.net/pdf?id=Xxot90rctA)
- {: data-topics="multimedia"} **Kiwi-Edit: Versatile Video Editing via Instruction and Reference Guidance** <br> <span class="authors">Yiqi Lin, Guoqiang Liang, Ziyun Zeng, Zechen Bai, <u><b>Yanzhe Chen</b></u>, Mike Zheng Shou</span> <br> <span class="venue preprint">arXiv 2026</span> [Paper](https://arxiv.org/abs/2603.02175)
- **Spectral Surgery: Training-Free Refinement of LoRA via Gradient-Guided Singular Value Reweighting** <br> <span class="authors">Zailong Tian, <u><b>Yanzhe Chen</b></u>, Zhuoheng Han, Lizi Liao</span> <br> <span class="venue preprint">arXiv 2026</span> [Paper](https://arxiv.org/abs/2603.03995)

</div>

</div>

<span class='anchor' id='education'></span>

# 🏫 Education

<div class="edu-card">
  <img class="edu-logo" src="images/logo-nus.png" alt="National University of Singapore" loading="lazy">
  <div class="edu-body">
    <div class="row"><span class="t">National University of Singapore</span><span class="d">2025.08 – Present</span></div>
    <div class="s">Ph.D., School of Computer (SoC)</div>
  </div>
</div>

<div class="edu-card">
  <img class="edu-logo" src="images/logo-pku.png" alt="Peking University" loading="lazy">
  <div class="edu-body">
    <div class="row"><span class="t">Peking University</span><span class="d">2022.09 – 2025.06</span></div>
    <div class="s">Master, Academy for Advanced Interdisciplinary Studies (AAIS)</div>
    <ul class="edu-honors">
      <li><span class="h">Outstanding Graduate of the Wangxuan Institute of Computer Technology</span><span class="d">2025.06</span></li>
      <li><span class="h">Merit Student</span><span class="d">2024.11</span></li>
      <li><span class="h">Leo KoGuan Scholarship</span><span class="d">2024.11</span></li>
    </ul>
  </div>
</div>

<div class="edu-card">
  <img class="edu-logo" src="images/logo-whu.png" alt="Wuhan University" loading="lazy">
  <div class="edu-body">
    <div class="row"><span class="t">Wuhan University</span><span class="d">2018.09 – 2022.06</span></div>
    <div class="s">Undergraduate, School of Computer Science</div>
    <ul class="edu-honors">
      <li><span class="h">Outstanding Undergraduate Graduate</span><span class="d">2022.06</span></li>
      <li><span class="h">National Scholarship</span><span class="d">2020.11</span></li>
    </ul>
  </div>
</div>

<span class='anchor' id='service'></span>

# 📖 Service

<div class="info-card" markdown="1">

- Conference Reviewer: NeurIPS, CoRL, ICML, ICLR, AAAI, ACM MM, etc.
- Teaching Assistant: [NUS EE4309 Robot Perception](https://sites.google.com/view/nus-ee4309-2627)

</div>
