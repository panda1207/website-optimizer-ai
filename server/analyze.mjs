import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';

dotenv.config();
const app = express();
const port = 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(cors());
app.use(express.json());

const parseSuggestions = (content) => {
  let parsedData = [];
  try {
    parsedData = JSON.parse(content);
  } catch (error) {
    console.error('Error parsing suggestion:', error);
    console.log('Content that failed to parse:', content);
  }
  return parsedData;
}

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const htmlContent = await page.content();

    const prompt = `Analyze the following HTML. Suggest 5 improvements as an JSON array with title, description, updated HTML, updated CSS, and imageDescription (including the public image url) : ${htmlContent.substring(0, 8000)}...`;

    await browser.close();

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    let suggestions = parseSuggestions(response.choices[0].message.content);

    suggestions = await Promise.all(suggestions.map(async (suggestion) => {
      try {
        if (suggestion.imageDescription) {
          const imageResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: suggestion?.imageDescription,
            n: 1,
            size: '1024x1024'
          });
          suggestion.generatedImage = imageResponse.data[0].url;
        }
        return suggestion;
      } catch (error) {
        console.error('Error parsing suggestion:', error);
        return null;
      }
    }));
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});