#!/usr/bin/env node

import fs from 'fs'
import chalk from 'chalk'
import figlet from 'figlet'
import inquirer from 'inquirer'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'
import { createSpinner } from 'nanospinner'
import { Configuration, OpenAIApi } from 'openai'
import slugify from 'slugify'
import yaml from 'js-yaml'

let topicName 

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms))

const welcome = async () => {
  const rainbowTitle = chalkAnimation.rainbow('GPT Markdown Generator\n')
  await sleep()
  rainbowTitle.stop()

  console.log(`
    ${chalk.bgBlue('Welcome to the GPT Markdown Generator!')}
  `)
}

const askContentType = async () => {
  return await inquirer.prompt({
    type: 'list',
    name: 'contentType',
    message: 'What type of content do you want to generate?',
    choices: [
      { name: 'Articles', value: 'article' },
      { name: 'Blog Posts', value: 'blog' },
      { name: 'Book', value: 'book' },
      { name: 'Course', value: 'course' },
      { name: 'Documentation', value: 'documentation' },
      { name: 'Landing Page', value: 'landing-page' },
      { name: 'Newsletters', value: 'newsletter' },
    ],
  })
}

const askTopic = async () => {
  return await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'What topic do you want to discuss?',
    default: () => 'How to write a blog post',
  })

}

// const getContent = async (topicName) => {
//   const topicSpinner = createSpinner('Asking GPT to generate topics...').start()
//   generateContent(topicName)
//   topicSpinner.success({ text: 'GPT has generated topics!'})
//   const contentSpinner = createSpinner('Asking GPT to generate content for each topic ...').start()
//   contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})
// }

const generateSummary = async ({ topic }) => {
  figlet('Success!', (err, data) => {
    console.log(gradient.pastel.multiline(data))
  })
}

const generateContent = async ({count = 50, contentType, topic}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const openai = new OpenAIApi(configuration)

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML and Markdown formats.'},
          {'role': 'user', 'content': `Respond with a list of ${count} ${contentType} possible titles for the topic "${topic}". Do not count the list items.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content
  const topicFolder = slugify(topic)

  const ts = new Date().toISOString().slice(0, 10)
  // fs.mkdirSync(`${topicFolder}`)
  try {
    fs.mkdirSync(`_posts`)
  } catch (error) {
    
  }

  // fs.writeFileSync(`${ts}/response.json`, JSON.stringify(response.data, null, 2))
  // fs.writeFileSync(`${topicFolder}/readme.md`, content)

  let items = content.split('\n- ').slice(1)

  if (items.length === 0) {
    items = content.split('. ').slice(1).map(i => i.split('\n')[0])
  }

  const contentSpinner = createSpinner('Asking GPT to generate content for each topic ...').start()

  // for (const item of items) {
  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown formats.'},
            {'role': 'user', 'content': `Respond with an 800 word blog post on the topic "${item}" in Markdown format.`},
        ]
      }).then(itemResponse => {
        const content = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`_posts/${ts}-${slugify(item)}.md`, `---
title: '${item}'
date: ${ts}
---

${content}
`)
  })}))
  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})
}

await welcome()
const { contentType } = await askContentType()
const { topic } = await askTopic({ contentType })
await generateContent({ contentType, topic })
await generateSummary({ topic })