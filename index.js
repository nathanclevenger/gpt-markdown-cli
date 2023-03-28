#!/usr/bin/env node


import fs from 'fs'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'

import { configBlogPosts, generateBlogPosts } from './content/blog-posts.js'
import { configArticles } from './content/articles.js'
import { configBook } from './content/book.js'
import { configDocs } from './content/docs.js'
import { configLandingPages } from './content/landing-pages.js'
import { configEmails } from './content/emails.js'
import { configNewsletter } from './content/newsletter.js'

const generators = {
  'Blog Posts': generateBlogPosts,
}
const generateContent = args => {
  generators[args.contentType](args)
}

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

const program = new Command()

let args = { }
const updateArgs = updatedArgs => args = { ...args, ...updatedArgs }

const rainbowTitle = chalkAnimation.rainbow('GPT Markdown Generator\n')

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

configArticles(program)
configBlogPosts(program)
configBook(program)
configDocs(program)
configEmails(program)
configLandingPages(program)
configNewsletter(program)


program.action(async () => {

  console.log(gradient.pastel.multiline(figlet.textSync('GPTMD')))

  updateArgs(await inquirer.prompt({
    type: 'list',
    name: 'contentType',
    message: 'What type of content do you want to generate?',
    choices: program.commands.map(command => command._description)
  }))

  const contentTypeConfig = program.commands.find(command => command._description === args.contentType)
  // console.log(contentTypeConfig)

  for (const arg of contentTypeConfig._args) {
    updateArgs(await inquirer.prompt({
      type: 'input',
      name: arg._name,
      message: arg.description,
      default: () => arg.defaultValue,
    }))
  }

  for (const option of contentTypeConfig.options) {
    updateArgs(await inquirer.prompt({
      type: 'input',
      name: option.long.replace('--', ''),
      message: option.description,
      default: () => option.defaultValue,
    }))
  }

  generateContent(args)

})

program.parse()

if (args.contentType) generateContent(args)
