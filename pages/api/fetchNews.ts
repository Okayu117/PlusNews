import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';

const parser = new Parser();

const rssFeeds = [
  'https://news.yahoo.co.jp/rss/topics/sports.xml',
  'https://news.yahoo.co.jp/rss/topics/science.xml',
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
  'https://news.yahoo.co.jp/rss/topics/business.xml',
  'https://www.asahi.com/rss/asahi/newsheadlines.rdf',
  'https://news.yahoo.co.jp/rss/topics/domestic.xml',
];

const ARTICLES_PER_PAGE = 5; // 1ページあたりの記事数を設定

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit } = req.query; // ページ番号をクエリから取得、デフォルトは1
    const ARTICLES_PER_PAGE = limit ? Number(limit) : 5; // クエリのlimitパラメータがある場合はその値を使用
    const allArticles: Array<{ title: string; link: string; content: string; pubDate: string; source: string; }> = [];

    // RSSフィードを全て取得して、記事を結合
    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      const articles = feed.items?.map(item => {
        // pubDateが存在しない場合の処理
        const pubDate = item.pubDate || item.isoDate || '';
        return {
          title: item.title || '',
          link: item.link || '',
          content: item.contentSnippet || '',
          pubDate: pubDate,
          source: feed.title || '',
        };
      });
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
