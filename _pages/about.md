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
    border-bottom: 1px solid #8C929D !important; /* 这里用莫兰迪灰调，和你的名字颜色一致 */
  }
</style>


{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# 👨🏻‍🎓 Biography

I am currently a Ph.D. student at the [Show Lab](https://sites.google.com/view/showlab/home), <span style="color: #D08130;">National University of Singapore</span>, advised by [Prof. Mike Zheng Shou](https://scholar.google.com/citations?user=h1-3lSoAAAAJ&hl=zh-CN).

I obtained my Master of Science degree from the [AAIS](http://www.aais.pku.edu.cn/) at <span style="color: #A62B24;">Peking University</span>, where I was fortunate to be advised by [Prof. Yuxin Peng](http://39.108.48.32/mipl/pengyuxin/). 

Previously, I have interned at TikTok and Kuaishou.

My research interests include **Agent**, **Robotics**, and **Multimedia**.

I’m open to collaborations and discussions. Feel free to drop me an [email](mailto:chenyanzhe@u.nus.edu)!

<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->


<span class='anchor' id='news'></span>
# 🔥 News
- [2026.05] [Code2Video](https://showlab.github.io/Code2Video/) and [ACA](https://arxiv.org/abs/2605.07381) got accepted by ICML 2026 🎉
- [2026.01] We won the third place in [RoCo Challenge](https://rocochallenge.github.io/RoCo2026/) @AAAI Embodied AI Workshop 2026 🎉
- [2025.11] [UniAPO](https://arxiv.org/abs/2508.17890) got accepted by AAAI 2026 🎉
- [2025.10] Check out our newest work on creative video generation: [Code2Video](https://showlab.github.io/Code2Video/)!
- [2025.08] Joined [Show Lab @ NUS](https://sites.google.com/view/showlab/home) to start my Ph.D. journey!

<span class='anchor' id='publications'></span>
# 📝 Publications 

## ⭐ Selected Publications

<div style="display: flex; flex-wrap: wrap; gap: 4%; align-items: center; margin-bottom: 2rem;">
  <div style="flex: 2; min-width: 200px;">
    <img src='images/code2video.png' alt="Code2Video" style="width: 100%; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  </div>
  <div style="flex: 3; min-width: 300px;" markdown="1">

**[Code2Video: A Code-centric Paradigm for Educational Video Generation](https://showlab.github.io/Code2Video/)** <b style="color: #4A86C4;">ICML 2026</b> <br>
<span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u><sup>*</sup>, Kevin QH Lin<sup>*</sup>, Mike Zheng Shou</span>  

<span style="color: #A62B24;">Code2Video is an agentic, code-centric framework that generates high-quality educational videos from knowledge points.</span>

[🌐 Project](https://showlab.github.io/Code2Video/) &nbsp;&nbsp;•&nbsp;&nbsp; [📄 PDF](https://arxiv.org/abs/2510.01174) &nbsp;&nbsp;•&nbsp;&nbsp; [💻 Code](https://github.com/showlab/Code2Video) &nbsp;&nbsp;•&nbsp;&nbsp; [🤗 Dataset](https://huggingface.co/datasets/YanzheChen/MMMC)

  </div>
</div>

<br>

---

## 📚 All Publications

### 🤖 Agent

*(New works coming soon...)*

<br>

### 🦾 Robotics

*(New works coming soon...)*

<br>

### 🖼️ Multimedia

- **MAI: A Multi-turn Aggregation-Iteration Model for Composed Image Retrieval** <br> <b style="color: #4A86C4;">ICLR 2025</b> &nbsp;\|&nbsp; [📄 PDF](https://openreview.net/pdf?id=gXyWbl71n1) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Zhiwen Yang, Jinglin Xu, Yuxin Peng</span>

- **FashionERN: Enhance-and-Refine Network for Composed Fashion Image Retrieval** <br> <b style="color: #4A86C4;">AAAI 2024</b> &nbsp;\|&nbsp; [📄 PDF](https://ojs.aaai.org/index.php/AAAI/article/view/27885/27795) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Jiahuan Zhou, Lele Cheng</span>

- **SPIRIT: Style-guided Patch Interaction for Fashion Image Retrieval with Text Feedback** <br> <b style="color: #4A86C4;">TOMM 2024</b> &nbsp;\|&nbsp; [📄 PDF](https://dl.acm.org/doi/10.1145/3640345) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Jiahuan Zhou, Yuxin Peng</span>

- **Real20M: A Large-scale E-commerce Dataset for Cross-domain Retrieval** <br> <b style="color: #4A86C4;">ACM MM 2023</b> &nbsp;\|&nbsp; [📄 PDF](https://dl.acm.org/doi/abs/10.1145/3581783.3612408) <br> <span style="color: #8C929D;"><u><b>Yanzhe Chen</b></u>, Huasong Zhong, Xiangteng He, Yuxin Peng, Lele Cheng</span>


<span class='anchor' id='education'></span>
# 🏫 Education
- \[2025.08 - now\]: Ph.D., School of Computer (SoC), <span style="color: #D08130;">National University of Singapore</span>.
- \[2022.09 - 2025.06\]: Master, Academy for Advanced Interdisciplinary Studies (AAIS), <span style="color: #A62B24;">Peking University</span>.
- \[2018.09 - 2022.06\]: Undergraduate, School of Computer Science, <span style="color: #34777B;">Wuhan University</span>.

<span class='anchor' id='honors'></span>
# 🎖 Honors
- [2025]: Outstanding Graduate of the Wangxuan Institute of Computer Technology, Peking University
- [2024]: Merit Student, Peking University
- [2024]: Leo KoGuan Scholarship
- [2022]: Outstanding Undergraduate Graduate, Wuhan University
- [2020]: National Scholarship


<span class='anchor' id='service'></span>
# 📖 Service
- Conference Reviewer: NeurIPS, ICLR, CVPR, ICCV, AAAI, ACM MM, etc.
