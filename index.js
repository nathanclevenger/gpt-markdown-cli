#!/usr/bin/env node


import fs from 'fs'
import chalk from 'chalk'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'
import { createSpinner } from 'nanospinner'
import { Configuration, OpenAIApi } from 'openai'
import slugify from 'slugify'
import yaml from 'js-yaml'

import pkg from './package.json' assert { type: 'json' }
// import { generateContent } from './gpt'


const program = new Command()

let args = { }
const updateArgs = updatedArgs => args = { ...args, ...updatedArgs }

const rainbowTitle = chalkAnimation.rainbow('GPT Markdown Generator\n')

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

program.command('articles')
  .description('Generate Articles on a topic')
  .argument('<topic>', 'the topic to write Articles about')
  .option('-n, --number <number>', 'the number of Articles to write', '50')
  .option('-o, --output <path>', 'the path to the output folder', '_posts')
  .option('-w, --words <words>', 'how many words per item generated', '2000')
  .action((str, options) => args = { contentType: 'Articles', topic: str, ...options })

program.command('blog')
  .description('Generate Blog Posts on a topic')
  .argument('<topic>', 'the topic to write Blog Posts about')
  .option('-n, --number <number>', 'the number of Blog Posts to write', '50')
  .option('-o, --output <path>', 'the path to the output folder', '_posts')
  .option('-w, --words <words>', 'how many words per item generated', '2000')
  .action((str, options) => args = { contentType: 'Blog', topic: str, ...options })

program.command('book')
  .description('Generate a Book on a topic')
  .argument('<topic>', 'the topic to write the Book about')
  .option('-n, --number <number>', 'the number of Chapters in the book', '20')
  .option('-o, --output <path>', 'the path to the output folder', '_posts')
  .option('-w, --words <words>', 'how many words per item generated', '2000')
  .action((str, options) => args = { contentType: 'Book', topic: str, ...options })

program.action(async () => {
  // await sleep()
  // rainbowTitle.stop()

  console.log(gradient.pastel.multiline(figlet.textSync('GPTMD')))

  updateArgs(await inquirer.prompt({
    type: 'list',
    name: 'contentType',
    message: 'What type of content do you want to generate?',
    choices: [ 'Articles' , 'Blog Posts', 'Book', 'Documentation', 'Email Sequence', 'Landing Page', 'Newsletters', 'Video'],
  }))

  updateArgs(await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'What topic do you want to discuss?',
    default: () => 'How to write a blog post',
  }))

  updateArgs(await inquirer.prompt({
    type: 'input',
    name: 'number',
    message: `How many do you want to write?`,
    default: () => '50',
  }))

  updateArgs(await inquirer.prompt({
    type: 'input',
    name: 'number',
    message: `How many words should be generated per item?`,
    default: () => '2000',
  }))

  updateArgs(await inquirer.prompt({
    type: 'input',
    name: 'output',
    message: `What path should the content be output?`,
    default: () => '_posts',
  }))

  // console.log({args})

  generateContent(args)

})


program.parse()

if (args.contentType) generateContent(args)

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)

export const generateContent = async ({contentType, number, topic, output}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.'},
          {'role': 'user', 'content': `Respond with a list of ${number} possible titles of ${contentType} for the topic "${topic}". Do not count the items in the list.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content
  const topicFolder = slugify(topic)

  const ts = new Date().toISOString().slice(0, 10)

  try {
    fs.mkdirSync(output)
  } catch (error) {
    
  }

  const items = itemParser(content)

  const toc = `# ${topic}
  
  ${items.map(item => ` - [${item}](/${slugify(item, { strict: true })})`).join('\n')}

  
  `

  fs.appendFileSync(`${output}/index.md`, toc)

  const contentSpinner = createSpinner('Asking GPT to generate content for each topic ...').start()

  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format that starts with title  `#`.'},
            {'role': 'user', 'content': `Respond with a 2000 word blog post on the topic "${item}" which will be posted on a blog about ${topic}.`},
        ]
      }).then(itemResponse => {
        const content = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`${output}/${slugify(item, { strict: true })}.md`, content)
  })}))

  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})

  console.log(gradient.pastel.multiline(figlet.textSync('Success!')))

}
const itemParser = content =>  {
  // Default if this is a YAML array
  let items = content.split('\n- ').slice(1)

  // Handle if numbered list (occassionally happens, even against instructions)
  if (items.length === 0) {
    items = content.split('. ').slice(1).map(i => i.split('\n')[0])
  }

  return items
}