import fs from 'fs'

export const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms))
export const updateArgs = updatedArgs => args = { ...args, ...updatedArgs }


export const defaultOutput = fs.existsSync('./next.config.js') 
export const isNext = fs.existsSync('./next.config.js')