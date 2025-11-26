// const { Octokit } = require('@octokit/rest')

// const CREATE_MESSAGE = 'Create dump'
// const UPDATE_MESSAGE = 'Update dump (if something has changed)'

// const octokit = new Octokit({
//   auth: config.githubToken
// })

// const tasks = config.tables.map(table => fetchTable({ base, table }))

// Promise.all(tasks).then(results => results.reduce((tables, result) => {
//   tables[result.table] = result.data
//   return tables
// }, {})).catch(err => console.error(err)).then(tables => {
//   // Use json-stable-stringify to ensure the JSON to be the same, even if the order has changed
//   const json = stringify(tables, { space: 2 })
//   console.log(json)
//   //return updateOrCreate(json)
// // }).then(() => {
// //   console.log(`Successful. See https://github.com/${config.owner}/${config.repo}/`)
// }).catch(err => { console.error('Error during Airtable dump to Github', err) })

// const updateOrCreate = (text) => octokit.repos.getContents({
//   owner: config.owner,
//   repo: config.repo,
//   path: config.filename
// }).catch(err => {
//   if (err.status !== 404) {
//     throw new Error(err)
//   } // else: it's ok
// }).then(result => {
//   const createParams = {
//     owner: config.owner,
//     repo: config.repo,
//     path: config.filename,
//     message: CREATE_MESSAGE,
//     content: Buffer.from(text, 'utf-8').toString('base64')
//   }
//   const updateParams = (result && result.data && result.data.sha) ?
//     {sha: result.data.sha, message: UPDATE_MESSAGE} : {}

//   return octokit.repos.createOrUpdateFile({...createParams, ...updateParams})
// })
