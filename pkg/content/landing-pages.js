import fs from 'fs'
import path from 'path'
import figlet from 'figlet'
import slugify from 'slugify'
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import { openai } from '../utils/gpt.js'
import { createToc } from '../utils/toc.js'
import { isNext } from '../utils/utils.js'


export const configLandingPages = program => {
  program.command('landing')
  .description('Landing Pages')
  .argument('[topic]', 'What topic do you want to discuss?', 'How to write a book')
  .option('-c, --chapters <number>', 'the number of Chapters in the book', '20')
  .option('-w, --words <words>', 'How many words should be generated per chapter?', '2000')
  .option('-o, --output <path>', 'What path should the content be output?', isNext ? path.join('pages/posts') : '_posts')
  .action((str, options) => args = { contentType: 'Book', topic: str, ...options })
}


export const generateLandingPages = async ({topic, description, name}) => {
  

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {'role': 'system', 'content': systemMessage },
      {'role': 'user', 'content': `Write the Landing Page for a ${description} called "${name}" - You should include a Header, Hero, 6 features, 8 benefits, 3 Pricing Plans, 10 FAQs, and 6 Blog Posts, and a Footer.  All images, logos & icons should be names from React Icons.`},
    ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

}

const systemMessage = `You are a helpful assistant for building professionally-written and highly converting Landing Pages that only responds in the following YAML format:

\`\`\`yaml
Header:
  logo: ReactIcons
  menu: [MenuItem]
  action: Action | [Action]

Hero: 
  _type: Section

Features:
  _type: Section 
  features: 
    icon: string | svg | url | Image
    name: string
    description: Markdown
    
Benefits:
  _type: Section
  benefits: 
    icon: string | svg | url | Image
    name: string
    description: Markdown
    
Pricing: 
  _type: Section
  plans:
    name: string
    description: Markdown
    monthlyPrice: currency
    annualPrice: currency
    features: [string]

FAQ: 
  _type: Section
  questions:
    question: string
    answer: markdown

Blog: 
  _type: Section
  posts:
    title: string
    description: markdown

CallToAction:
  _type: Section

Newsletter:
  _type: Section
  
Section: 
  _sameAs: https://schema.org/WebPageElement
  headerBadge: string
  headerText: string
  title: string
  subtitle: string
  description: string | markdown
  image: url | svg | Code | Image
  imagePosition: Left | Right | Center
  action: Action | [Action]

MenuItem:
  _sameAs: https://schema.org/SiteNavigationElement
  [string]: url

Action:
  [string]: url

\`\`\``