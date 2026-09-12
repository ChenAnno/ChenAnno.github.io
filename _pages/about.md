---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<style>
  a, .page__content a {
    text-decoration: none !important;
    border-bottom: none !important;
    box-shadow: none !important;
  }

  a:hover, .page__content a:hover {
    text-decoration: none !important;
    border-bottom: none !important;
    box-shadow: none !important;
  }
  u, ins {
    text-decoration: none !important;
    border-bottom: 1px solid #8C929D !important;
  }

  /* Colored "Show" in Show-Harness */
  .show-S { color: #669ED3; }
  .show-h { color: #67A651; }
  .show-o { color: #D85E5D; }
  .show-w { color: #F3AA68; }
</style>

<script>
  /* Videos with class "lazy-video" use preload="none", so nothing is downloaded until they scroll into view and start playing. */
  document.addEventListener('DOMContentLoaded', function () {
    var videos = document.querySelectorAll('video.lazy-video');
    function start(v) {
      if (v.played.length) return;
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(videos, start);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          start(entry.target);
        }
      });
    }, { threshold: 0.25 });
    Array.prototype.forEach.call(videos, function (v) { observer.observe(v); });
  });
</script>


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

I’m open to collaborations and discussions. Feel free to drop me an [email](mailto:chenyanzhe@u.nus.edu)!


<span class='anchor' id='news'></span>
# 🔥 News
- `2026.09` We released [<span class="show-S">S</span><span class="show-h">h</span><span class="show-o">o</span><span class="show-w">w</span>-Harness](https://showlab.github.io/Show-Harness/), an embodied harness enabling frontier & lightweight VLMs to play robots 🦾
- `2026.05` [Code2Video](https://showlab.github.io/Code2Video/) and [ACA](https://arxiv.org/abs/2605.07381) got accepted by ICML 2026 🎉
- `2026.01` We won the third place in [RoCo Challenge](https://rocochallenge.github.io/RoCo2026/) @AAAI Embodied AI Workshop 2026 🎉
- `2025.11` [UniAPO](https://arxiv.org/abs/2508.17890) got accepted by AAAI 2026 🎉
- `2025.08` Joined [Show Lab @ NUS](https://sites.google.com/view/showlab/home) to start my Ph.D. journey!

<span class='anchor' id='publications'></span>
# 📝 Publications 

## ⭐ Selected Publications

<div style="display: flex; flex-wrap: wrap; gap: 4%; align-items: center; margin-bottom: 2rem;">
  <div style="flex: 2; min-width: 200px;">
    <video class="lazy-video" src='images/show-harness.mp4' poster='images/show-harness-poster.jpg' preload="none" muted loop playsinline controls style="width: 100%; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"></video>
  </div>
  <div style="flex: 3; min-width: 300px;" markdown="1">

**<span class="show-S">S</span><span class="show-h">h</span><span class="show-o">o</span><span class="show-w">w</span>-Harness: Just a VLM Agent Can Play Robots** <br>
<span style="color: #E67C46;">Arxiv 2026</span> <br>
<span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zechen Bai<sup>*</sup>, Zhijun Cao<sup>*</sup>, Wenzheng Zeng<sup>*</sup>, Kevin Qinghong Lin, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Qiming Huang, Mike Zheng Shou</span>  
<span style="color: #A62B24;">Show-Harness is an embodied harness that lets VLMs *play* robots through a compact semantic action interface.</span>

[🌐 Project](https://showlab.github.io/Show-Harness/) &nbsp;&nbsp;•&nbsp;&nbsp; [📄 Paper](https://arxiv.org/abs/2609.10522) &nbsp;&nbsp;•&nbsp;&nbsp; [💻 Code](https://github.com/showlab/Show-Harness) &nbsp;&nbsp;•&nbsp;&nbsp; [🤗 Models](https://huggingface.co/showlab/Show-Harness-VLMs) &nbsp;&nbsp;•&nbsp;&nbsp; [🤗 Dataset](https://huggingface.co/datasets/showlab/Show-Harness-Data)

  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 4%; align-items: center; margin-bottom: 2rem;">
  <div style="flex: 2; min-width: 200px;">
    <video class="lazy-video" src='images/code2video.mp4' poster='images/code2video-poster.jpg' preload="none" muted loop playsinline controls style="width: 100%; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"></video>
  </div>
  <div style="flex: 3; min-width: 300px;" markdown="1">

**Code2Video: A Code-centric Paradigm for Educational Video Generation** <br>
<span style="color: #E67C46;">ICML 2026</span> <br>
<span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Kevin Qinghong Lin<sup>*</sup>, Mike Zheng Shou</span>  
<span style="color: #A62B24;">Code2Video is an agentic, code-centric framework that generates high-quality educational videos from tutorial topics.</span>

[🌐 Project](https://showlab.github.io/Code2Video/) &nbsp;&nbsp;•&nbsp;&nbsp; [📄 Paper](https://arxiv.org/abs/2510.01174) &nbsp;&nbsp;•&nbsp;&nbsp; [💻 Code](https://github.com/showlab/Code2Video) &nbsp;&nbsp;•&nbsp;&nbsp; [🤗 Dataset](https://huggingface.co/datasets/YanzheChen/MMMC)

  </div>
</div>


---

## 📚 All Publications

### 🤖 Agent

- **Code2Video: A Code-centric Paradigm for Educational Video Generation** <br> <span style="color: #E67C46;">ICML 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/abs/2510.01174) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Kevin Qinghong Lin<sup>*</sup>, Mike Zheng Shou</span>  

- **PaperDoctor: Evidence-Grounded and Actionable Feedback for Scientific Papers in Progress** <br> <span style="color: #E67C46;">ICMLW AI4S 2026 · Best Poster Award</span> &nbsp;\|&nbsp; [📄 Paper](https://openreview.net/pdf?id=Xxot90rctA) <br> <span style="color: #8C929D;">Kevin Qinghong Lin, Siyuan Hu, Pan Lu, Yu Chen, <u><b>Yanzhe Chen</b></u>, Owen Queen, Yupeng Chen, Jialin Yu, Junchi Yu, Zifeng Ding, Yuanfeng Ji, Sheng Liu, Jindong Gu, Linjie Li, Mike Zheng Shou, Philip Torr, James Zou</span>


### 🦾 Robotics

- **Show-Harness: Just a VLM Agent Can Play Robots** <br> <span style="color: #E67C46;">Arxiv 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/abs/2609.10522) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zechen Bai<sup>*</sup>, Zhijun Cao<sup>*</sup>, Wenzheng Zeng<sup>*</sup>, Kevin Qinghong Lin, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Qiming Huang, Mike Zheng Shou</span>

- **Where Success Breaks: Failure-Boundary Learning for Robust Vision-Language-Action Models** <br> <span style="color: #E67C46;">CoRL 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/abs/2609.06114) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Zhijun Cao<sup>*</sup>, Mike Zheng Shou</span>

- **Escaping the Diversity Trap in Robotic Manipulation via Anchor-Centric Adaptation** <br> <span style="color: #E67C46;">ICML 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/pdf/2605.07381) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Kevin Yuchen Ma, Qi Lv, Yiqi Lin, Zechen Bai, Chen Gao, Mike Zheng Shou</span>

- **Supervise What Survives: Geometry-Guided VLA Adaptation from Synthetic Robot Videos** <br> <span style="color: #E67C46;">CoRL 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/pdf/2606.24448) <br> <span style="color: #8C929D;">Danze Chen, <u><b>Yanzhe Chen</b></u>, Qiming Huang, Zhijun Cao, Chen Gao, Mike Zheng Shou</span>

- **ActionMap: Robot Policy Learning via Voxel Action Heatmap** <br> <span style="color: #E67C46;">Arxiv 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://arxiv.org/pdf/2606.06904) <br> <span style="color: #8C929D;">Pei Yang<sup>*</sup>, Hai Ci<sup>*</sup>, <u><b>Yanzhe Chen</b></u><sup>*</sup>, Qi Lv, Han Cai, Mike Zheng Shou</span>


### 🖼️ Multimedia

- **UniAPO: Unified Multimodal Automated Prompt Optimization** <br> <span style="color: #E67C46;">AAAI 2026</span> &nbsp;\|&nbsp; [📄 Paper](https://ojs.aaai.org/index.php/AAAI/article/view/40151) <br> <span style="color: #8C929D;">Qipeng Zhu<sup>*</sup>, <u><b>Yanzhe Chen</b></u><sup>*</sup>, Huasong Zhong<sup>*</sup>, Jie Chen, Yan Li, Zhixin Zhang, Junping Zhang, Zhenheng Yang</span>  

- **MAI: A Multi-turn Aggregation-Iteration Model for Composed Image Retrieval** <br> <span style="color: #E67C46;">ICLR 2025</span> &nbsp;\|&nbsp; [📄 Paper](https://openreview.net/pdf?id=gXyWbl71n1) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Zhiwen Yang, Jinglin Xu, Yuxin Peng</span>  

- **FashionERN: Enhance-and-Refine Network for Composed Fashion Image Retrieval** <br> <span style="color: #E67C46;">AAAI 2024</span> &nbsp;\|&nbsp; [📄 Paper](https://ojs.aaai.org/index.php/AAAI/article/view/27885/27795) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Jiahuan Zhou, Lele Cheng</span>  

- **SPIRIT: Style-guided Patch Interaction for Fashion Image Retrieval with Text Feedback** <br> <span style="color: #E67C46;">TOMM 2024</span> &nbsp;\|&nbsp; [📄 Paper](https://dl.acm.org/doi/10.1145/3640345) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Jiahuan Zhou, Yuxin Peng</span>  

- **Real20M: A Large-scale E-commerce Dataset for Cross-domain Retrieval** <br> <span style="color: #E67C46;">ACM MM 2023</span> &nbsp;\|&nbsp; [📄 Paper](https://dl.acm.org/doi/abs/10.1145/3581783.3612408) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Lele Cheng</span>  


<span class='anchor' id='education'></span>
# 🏫 Education
- `2025.08 - Present` Ph.D., School of Computer (SoC), <span style="color: #E67C46;">National University of Singapore</span>.
- `2022.09 - 2025.06` Master, Academy for Advanced Interdisciplinary Studies (AAIS), <span style="color: #A62B24;">Peking University</span>.
- `2018.09 - 2022.06` Undergraduate, School of Computer Science, <span style="color: #34777B;">Wuhan University</span>.

<span class='anchor' id='honors'></span>
# 🎖 Honors
- `2025.06` Outstanding Graduate of the Wangxuan Institute of Computer Technology, Peking University
- `2024.11` Merit Student, Peking University
- `2024.11` Leo KoGuan Scholarship
- `2022.06` Outstanding Undergraduate Graduate, Wuhan University
- `2020.11` National Scholarship


<span class='anchor' id='service'></span>
# 📖 Service
- Conference Reviewer: NeurIPS, CoRL, ICML, ICLR, AAAI, ACM MM, etc.
- Teaching Assistant: [NUS EE4309 Robot Perception](https://sites.google.com/view/nus-ee4309-2627)

<br>
