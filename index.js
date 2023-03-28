#!/usr/bin/env node


import fs from 'fs'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'

import { configBlogPosts, generateBlogPosts } from './content/blog-posts.js'
import { configArticles, generateArticles } from './content/articles.js'
import { configBook, generateBook } from './content/book.js'
import { configDocs, generateDocs } from './content/docs.js'
import { configLandingPages, generateLandingPages } from './content/landing-pages.js'
import { configEmails, generateEmails } from './content/emails.js'
import { configNewsletter, generateNewsletter } from './content/newsletter.js'
import { configOther, generateOther } from './content/other.js'
import { configProducts, generateProducts } from './content/products.js'
import { configVideos, generateVideos } from './content/videos.js'

const generators = {
  'Articles': generateArticles,
  'Blog Posts': generateBlogPosts,
  'Book': generateBook,
  'Documentation': generateDocs,
  'Email Sequence': generateEmails,
  'Landing Page': generateLandingPages,
  'Newsletter': generateNewsletter,
  'Other': generateOther,
  'Product': generateProducts,
  'Video': generateVideos,
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
configOther(program)
configNewsletter(program)
configProducts(program)
configVideos(program)


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
