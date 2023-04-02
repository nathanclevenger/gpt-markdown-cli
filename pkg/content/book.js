import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import figlet from 'figlet'
import slugify from 'slugify'
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import { openai } from '../utils/gpt.js'
import { createToc } from '../utils/toc.js'
import { isNext } from '../utils/utils.js'

export const configBook = program => {
  program.command('book')
    .description('Book')
    .argument('[topic]', 'What topic do you want to discuss?', 'How to write a book')
    .option('-p, --parts <parts>', 'the number of Parts in the book', '5')
    .option('-c, --chapters <chapters>', 'the number of Chapters in the book', '20')
    .option('-s, --sections <sections>', 'the number of Sections in each Chapter', '5')
    .option('-w, --words <words>', 'How many words should be generated per section?', '2000')
    .option('-o, --output <path>', 'What path should the content be output?', isNext ? path.join('pages/posts') : '_posts')
    .action((str, options) => args = { contentType: 'Book', topic: str, ...options })
}

export const generateBook = async ({chapters, sections, topic, output, words}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    // model: 'gpt-3.5-turbo',
    model: 'gpt-4',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.' },
          {'role': 'user', 'content': `Respond with ${chapters} chapter titles for a book on the topic "${topic}". `},
          // {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format.' },
          // {'role': 'system', 'content': systemPrompt },
          // {'role': 'user', 'content': `Respond with a Table of Contents for a book on the topic "${topic}" with ${parts} parts and ${chapters} chapters. Do not number the parts or chapters.`}
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content

  // fs.writeFileSync(`${output}/outline.md`, yaml.dump(content))

  const items = createToc({topic, content, output})

  const contentSpinner = createSpinner('Asking GPT to generate sections for each chapter ...').start()

  const chapterSections = await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            // {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.' },
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format.' },
            {'role': 'user', 'content': `Respond with ${sections} section titles in the "${item}" chapter for a book with the following chapters: \n\n${content} `},
        ]
      }).then(itemResponse => {
        const itemContent = itemResponse.data.choices[0].message.content
        // fs.writeFileSync(`${output}/${slugify(item, { strict: true })}.md`, itemContent)
        return itemContent
  })}))

  fs.writeFileSync(`${output}/sections.md`, yaml.dump(chapterSections))

  contentSpinner.success({ text: 'GPT has completed generating all of the section titles for each chapter!'})

  console.log(gradient.pastel.multiline(figlet.textSync('Success!')))

}

const systemPrompt = `You are a helpful assistant that responds in following YAML format:

\`\`\`yaml
title: 
description: 
parts:
  - title:
    description:
    chapters:
      - title:
        description:
        sections:
          - title:
            description:
\`\`\`

For each requested number of parts, chapters, and sections, respond with a title and description. Do not number the parts, chapters or sections.

`