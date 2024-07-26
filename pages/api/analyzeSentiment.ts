import type { NextApiRequest, NextApiResponse } from 'next';
import { LanguageServiceClient } from '@google-cloud/language';

type Data = {
  score?: number;
  magnitude?: number;
  error?: string;
};

// APIハンドラ
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    const client = new LanguageServiceClient();
    const { text } = req.body;

    const document = {
      content: text,
      type: 'PLAIN_TEXT' as const,
      language: 'ja'
    };

    try {
      const [result] = await client.analyzeSentiment({ document });
      const sentiment = result.documentSentiment;
      console.log('Sentiment analysis result:', sentiment); // 追加
      res.status(200).json({ score: sentiment?.score ?? undefined, magnitude: sentiment?.magnitude ?? undefined });
    } catch (error: unknown) {
      console.error('Error analyzing sentiment:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
