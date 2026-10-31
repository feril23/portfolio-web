"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPostBySlug, getPostTranslation } from "../lib/api.js";
import { Link, registerLocaleResolver } from "../lib/router.jsx";
import { useUI, useLocale } from "../i18n/context.jsx";
import {
  finishSharedTextTransition,
  getPendingSharedArticle,
} from "../lib/sharedTextTransition.js";

function formatDate(value, locale) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      },
    );
  } catch {
    return "";
  }
}

function inline(text, keyBase) {
  const nodes = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0,
    match,
    i = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[2]) nodes.push(<strong key={keyBase + i}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={keyBase + i}>{match[3]}</em>);
    else if (match[4]) nodes.push(<code key={keyBase + i}>{match[4]}</code>);
    else if (match[5])
      nodes.push(
        <a key={keyBase + i} href={match[6]} target="_blank" rel="noreferrer">
          {match[5]}
        </a>,
      );
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Markdown({ source }) {
  const lines = (source || "").split("\n");
  const blocks = [];
  let list = null,
    para = [];
  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={`p-${blocks.length}`}>
        {inline(para.join(" "), `p-${blocks.length}-`)}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(<ul key={`u-${blocks.length}`}>{list}</ul>);
    list = null;
  };
  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      return;
    }
    let match;
    if ((match = line.match(/^(#{1,3})\s+(.*)/))) {
      flushPara();
      flushList();
      const Tag =
        match[1].length === 1 ? "h1" : match[1].length === 2 ? "h2" : "h3";
      blocks.push(
        <Tag key={`h-${blocks.length}`}>
          {inline(match[2], `h-${blocks.length}-`)}
        </Tag>,
      );
    } else if ((match = line.match(/^>\s?(.*)/))) {
      flushPara();
      flushList();
      blocks.push(
        <blockquote key={`q-${blocks.length}`}>
          {inline(match[1], `q-${blocks.length}-`)}
        </blockquote>,
      );
    } else if ((match = line.match(/^[-*]\s+(.*)/))) {
      flushPara();
      if (!list) list = [];
      list.push(
        <li key={list.length}>
          {inline(match[1], `li-${blocks.length}-${list.length}-`)}
        </li>,
      );
    } else {
      flushList();
      para.push(line);
    }
  });
  flushPara();
  flushList();
  return <div className="prose">{blocks}</div>;
}

export default function BlogPost({ post: initial = undefined, slug }) {
  const t = useUI();
  const locale = useLocale();
  const titleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const stagedPost =
    initial === undefined ? getPendingSharedArticle(slug, locale) : null;
  const [state, setState] = useState(
    initial !== undefined
      ? { loading: false, post: initial }
      : stagedPost
        ? { loading: false, post: stagedPost }
        : { loading: true, post: null },
  );

  useEffect(() => {
    if (initial !== undefined) return;
    getPostBySlug(slug, locale)
      .then((post) => setState({ loading: false, post }))
      .catch(() => setState({ loading: false, post: null }));
  }, [slug, initial, locale]);

  useEffect(() => {
    if (!state.post) return registerLocaleResolver(null);
    registerLocaleResolver(async (nextLocale) => {
      const counterpart = await getPostTranslation(state.post, nextLocale);
      return `/blog/${counterpart?.slug || state.post.slug}`;
    });
    return () => registerLocaleResolver(null);
  }, [state.post]);

  useEffect(() => {
    if (state.post && titleRef.current)
      finishSharedTextTransition(titleRef.current);
  }, [state.post]);

  useEffect(() => {
    const update = () => {
      const article = document.querySelector(".article-body");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const distance = Math.max(
        1,
        article.offsetHeight - window.innerHeight * 0.45,
      );
      setProgress(Math.max(0, Math.min(1, -rect.top / distance)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [state.post]);

  const minutes = useMemo(() => {
    const words = String(state.post?.content || "")
      .trim()
      .split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 210));
  }, [state.post]);

  const backTransition = state.post
    ? {
        sourceSelector: "[data-shared-title-target]",
        post: state.post,
        direction: "back",
      }
    : null;

  return (
    <main className="article-page">
      <div
        className="reading-progress"
        style={{ "--progress": progress }}
        aria-hidden="true"
      />
      <article className="article-shell">
        <div className="container">
          <Link
            to="/blog"
            className="article-back"
            sharedTitle={backTransition}
            data-hover
          >
            {t.blog.back}
          </Link>
          {state.loading ? (
            <p className="blog-empty">{t.blog.loading}</p>
          ) : !state.post ? (
            <p className="blog-empty">{t.blog.notFound}</p>
          ) : (
            <>
              <header className="article-header">
                <div className="article-kicker" data-enter>
                  <span>Journal / Essay</span>
                  <span>
                    {String(minutes).padStart(2, "0")}{" "}
                    {locale === "id" ? "menit baca" : "min read"}
                  </span>
                </div>
                <h1
                  ref={titleRef}
                  className="article-title"
                  data-shared-title-target
                >
                  {state.post.title}
                </h1>
                <div className="article-deck" data-enter>
                  <p>{state.post.excerpt}</p>
                  <time>
                    {formatDate(
                      state.post.published_at || state.post.created_at,
                      locale,
                    )}
                  </time>
                </div>
              </header>
              {state.post.cover_url && (
                <figure className="article-cover" data-enter>
                  <img src={state.post.cover_url} alt="" />
                </figure>
              )}
              <div className="article-layout">
                <aside className="article-aside">
                  <span>{locale === "id" ? "Ditulis oleh" : "Written by"}</span>
                  <strong>Feril Ferdian</strong>
                </aside>
                <div className="article-body" data-enter>
                  <Markdown source={state.post.content} />
                </div>
              </div>
              <footer className="article-end">
                <span>{locale === "id" ? "Akhir catatan" : "End note"}</span>
                <Link to="/blog" sharedTitle={backTransition} data-hover>
                  {locale === "id"
                    ? "Kembali ke semua tulisan"
                    : "Back to all writing"}{" "}
                  <i>↗</i>
                </Link>
              </footer>
            </>
          )}
        </div>
      </article>
    </main>
  );
}
