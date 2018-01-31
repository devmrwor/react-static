import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import autoCompletePrompt from 'inquirer-autocomplete-prompt'
import matchSorter from 'match-sorter'
import downloadGitRepo from 'download-git-repo'
import { promisify } from 'util'
import { ChalkColor } from '../utils'

inquirer.registerPrompt('autocomplete', autoCompletePrompt)

export default async () => {
  const files = await fs.readdir(path.resolve(__dirname, '../../examples/'))

  console.log('')

  let exampleList = files.filter(d => !d.startsWith('.'))
  exampleList = ['basic', ...exampleList.filter(d => d !== 'basic'), 'custom']

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What should we name this project?',
      default: 'my-static-site',
    },
    {
      type: 'autocomplete',
      name: 'template',
      message: 'Select a template below...',
      source: async (answersSoFar, input) =>
        !input ? exampleList : matchSorter(exampleList, input),
    },
  ])

  console.time(chalk.green(`=> [\u2713] Project "${answers.name}" created`))
  console.log('=> Creating new react-static project...')
  const dest = path.resolve(process.cwd(), answers.name)

  if (answers.template === 'custom') {
    const githubRepoAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'githubRepoName',
        message:
          'Specify a public repo from GitHub, BitBucket, or GitLab that has your custom template. Use the form "ownerName/repoName".',
        default: 'mjsisley/react-static-template-basic',
      },
    ])
    const getGitRepo = promisify(downloadGitRepo)
    try {
      // console.log(`Download of ${githubRepoAnswer.githubRepoName} Starting`)
      await getGitRepo(githubRepoAnswer.githubRepoName, dest)
    } catch (e) {
      // console.error(`Download of ${githubRepoAnswer.githubRepoName} Failed`)
    }
  } else {
    await fs.copy(path.resolve(__dirname, `../../examples/${answers.template}`), dest)
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  fs.move(path.join(dest, 'gitignore'), path.join(dest, '.gitignore'), [], err => {
    if (err) {
      // Append if there's already a `.gitignore` file there
      if (err.code === 'EEXIST') {
        const data = fs.readFileSync(path.join(dest, 'gitignore'))
        fs.appendFileSync(path.join(dest, '.gitignore'), data)
        fs.unlinkSync(path.join(dest, 'gitignore'))
      } else {
        throw err
      }
    }
  })

  const isYarn = shouldUseYarn()

  console.log(
    `=> Installing dependencies with: ${isYarn
      ? chalk.hex(ChalkColor.yarn)('Yarn')
      : chalk.hex(ChalkColor.npm)('NPM')}...`
  )
  // We install react-static separately to ensure we always have the latest stable release
  execSync(
    `cd ${answers.name} && ${isYarn ? 'yarn' : 'npm install'} && ${isYarn
      ? 'yarn add react-static@latest'
      : 'npm install react-static@latest --save'}`
  )
  console.log('')
  console.timeEnd(chalk.green(`=> [\u2713] Project "${answers.name}" created`))

  console.log(`
${chalk.green('=> To get started:')}

    cd ${answers.name}

    ${isYarn
    ? chalk.hex(ChalkColor.yarn)('yarn')
    : chalk.hex(ChalkColor.npm)('npm run')} start ${chalk.green('- Start the development server')}
    ${isYarn
    ? chalk.hex(ChalkColor.yarn)('yarn')
    : chalk.hex(ChalkColor.npm)('npm run')} build ${chalk.green('- Build for production')}
    ${isYarn
    ? chalk.hex(ChalkColor.yarn)('yarn')
    : chalk.hex(ChalkColor.npm)('npm run')} serve ${chalk.green(
  '- Test a production build locally'
)}
  `)
}

function shouldUseYarn () {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
