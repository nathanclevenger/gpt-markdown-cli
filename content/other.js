import fs from 'fs'
import figlet from 'figlet'
import slugify from 'slugify'
import pluralize from 'pluralize'
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import { openai } from '../utils/gpt.js'
import { createToc } from '../utils/toc.js'
import { isNext } from '../utils/utils.js'

export const configOther = program => {
  program.command('other')
    .description('Other')
    .argument('[contentName]', 'What kind of content do you want to create?', 'Poems')
    .argument('[title]', 'What are the names of those called?', 'title')
    .argument('[topic]', 'What topic do you want to discuss?', 'Startup Life')
    .option('-n, --number <number>', 'How many do you want to write?', '50')
    .option('-w, --words <words>', 'How many words should be generated per article?', '2000')
    .option('-o, --output <path>', 'What path should the content be output?', isNext ? path.join('pages/posts') : '_posts')
    .action((str, options) => args = { topic: str, ...options })
}

export const generateOther = async ({contentName, number, topic, title, output, words}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate ${number} ${contentName} on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.'},
          {'role': 'user', 'content': `Respond with a list of ${number} possible ${pluralize(title)} of ${contentName} for the topic "${topic}". Do not count the items in the list.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content

  const items = createToc({topic, content, output})

  const contentSpinner = createSpinner('Asking GPT to generate content for each topic ...').start()

  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format'},
            {'role': 'user', 'content': `Respond with a ${words} word ${contentName} with a ${title} of "${item}" which will be posted on a website about ${topic}.`},
        ]
      }).then(itemResponse => {
        const itemContent = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`${output}/${slugify(item, { strict: true })}.md`, itemContent)
  })}))

  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})

  console.log(gradient.pastel.multiline(figlet.textSync('Success!')))

}