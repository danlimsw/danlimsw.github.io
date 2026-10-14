---
title: "Tools"
permalink: /tools/
author_profile: true
---

{% comment %}
  Adding a tool:
  1. Put the markup in _pages/tools/<name>.html with front matter:
       title, permalink: /<name>/, author_profile: true,
       tool: true, tool_description: "one line"
  2. Put its CSS/JS in assets/tools/<name>/ and link them from the page with
     {{ '/assets/tools/<name>/<file>' | relative_url }}. Keep JS out of the page
     itself: compress_html collapses newlines, so // comments would break it.
  3. Scope every CSS rule under a wrapper class (e.g. .tool-<name>) so it
     doesn't clash with the theme.
  It will then be listed below automatically.
{% endcomment %}

Small calculators and utilities for use in and around the lab. They run entirely in your browser.

{% assign tools = site.pages | where: "tool", true | sort: "title" %}
{% for t in tools %}
- [{{ t.title }}]({{ t.url | relative_url }}){% if t.tool_description %} — {{ t.tool_description }}{% endif %}
{% endfor %}
