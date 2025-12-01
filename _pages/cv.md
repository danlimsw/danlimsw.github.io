---
layout: archive
title: "About PI"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

[Download PDF version of CV](https://danlimsw.github.io/files/20251023_CV.pdf)

Education
======
* Ph.D. Applied Physics, Harvard University, 2023
  * Thesis: [Sculpting the dark: Singularity engineering with metasurfaces](https://www.proquest.com/docview/2892615112/fulltextPDF/6CD9A7EFBA8C4A6FPQ/)
  * GPA: 4.0/4.0
* B.S. Physics, California Institute of Technology, 2017
  * Thesis: [Revolution in large-area curved surface lithography: Nanofilm sculpting by thermocapillary modulation](https://thesis.library.caltech.edu/10176/)
  * GPA: 4.3/4.3, rank 1/254
* Caltech Cambridge Scholar, Cambridge University, 2016
  * Class: First

Work experience
======
* Sep 2026 onwards: Nanyang Assistant Professor, Nanyang Technological University, Singapore
  * Department: Mechanical and Aerospace Engineering (MAE)

* Nov 2023 - Present: Schmidt Science Fellow, Stanford Medicine
  * Advisor: Prof. Steven Chu.
  * Developing low cost, high efficiency intracellular delivery techniques for *in vivo* diagnostics.

* Sep 2018 - Sep 2023: Doctoral Researcher, Harvard University
  * Advisor: Prof. Federico Capasso
  * Investigated counter-intuitive fundamental behavior of structured light fields containing optical singularities ("dark" regions of light).
  * Achieved a flat lens that uses extremely deep and narrow holes, the highest aspect ratio nanostructures for wavefront shaping as of publication.
  * Mentored an undergraduate (now PhD candidate, University of Toronto) and a high school student (now Harvard undergraduate).

* Jan 2018 - Jun 2018: Research Assistant, Bioprocessing Technology Institute, A*STAR
  * Advisor: Prof. Shireen Goh (now at SUTD, Singapore)
  * Modeled multiphase computational fluid dynamics for inertial focusing in dense particle-laden flows.
 
* Jul 2016 - Dec 2017: Research Engineer, Singapore Institute of Manufacturing Technology, A*STAR
  * Advisor: Prof. Wong Liang Jie (now at NTU, Singapore)
  * Numerically simulated strong-field light-matter interactions in laser-based particle acceleration.
 
* Jan 2015 - Jun 2017: Undergraduate Researcher, California Institute of Technology
  * Advisor: Prof. Sandra Troian.
  * Fabricated microlens arrays in polymer with spatially-varying surface tension.
 
Selected Awards
======
* [Lindau Young Scientist](https://www.lindau-nobel.org/) (2019).
* A*STAR Roll of Honor (2017).
* California Institute of Technology awards: 
  * [D.S. Kothari Prize in Physics](https://pma.caltech.edu/research-and-academics/physics/physics-prizes-awards/ds-kothari-prize-winners) (2017).
  * [Friends of the Caltech Libraries Senior Thesis Prize](https://library.caltech.edu/events/senior-thesis-prize) (2017).
  * [Haren Lee Fisher Memorial Award in Junior Physics](https://pma.caltech.edu/research-and-academics/physics/physics-prizes-awards/haren-lee-fisher-memorial-award-in-junior-physics-winners) (2016).
  * [Jack E. Froehlich Memorial Award](https://deans.caltech.edu/Grants_Funding/Froehlich) (2016).
* [Ken Hass Outstanding Student Paper Award](https://engage.aps.org/fiap/honors/prizes-awards/hass) (2017), American Physical Society.
* [International Physics Olympiad](https://ipho-unofficial.org/countries/SGP/individual) Silver Medal (2010). 

Fellowships and Grants
=====
- **US$220,000**: [Schmidt Science Fellowship](https://schmidtsciencefellows.org/), Schmidt Sciences (2024-2026)  
- **SGD$20,000**: [NUS Development Grant](https://www.nus.edu.sg/careers/nus-programmes/nus-programmes-scholarships/), National University of Singapore (2024-2025)  
- **8 years full funding**: [National Science Scholarship](https://www.a-star.edu.sg/Scholarships/for-undergraduate-studies/national-science-scholarship-bs), A*STAR Singapore (2013-2023)

Publications
======
{% assign counter = site.publications | size %} <!-- Initialize counter -->
{% for post in site.publications reversed %}
  {% include archive-single-cv.html counter=counter %} <!-- Pass counter to the include -->
  {% assign counter = counter | minus: 1 %} <!-- Decrement counter -->
{% endfor %}

  
Teaching
======
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

  Open-sourced class notes and textbook summaries available in [Course Notes](/coursenotes).
  

