import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';

const parser = new Parser();

const rssFeeds = [
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://www.asahi.com/rss/asahi/newsheadlines.rdf',
];

const ARTICLES_PER_PAGE = 5; // 1ページあたりの記事数を設定

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1 } = req.query; // ページ番号をクエリから取得、デフォルトは1
    const allArticles = [];

    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      const articles = feed.items?.map(item => ({
        title: item.title || '',
        link: item.link || '',
        content: item.contentSnippet || '',
        pubDate: item.pubDate || '',
        source: feed.title || '',
      }));
      if (articles) {
        allArticles.push(...articles);
      }
    }

    // 日付順に記事をソート（新しい順）
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // 指定されたページに対応する記事を抽出
    const startIndex = (Number(page) - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const paginatedArticles = allArticles.slice(startIndex, endIndex);

    res.status(200).json(paginatedArticles);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
}
