
import axios from 'axios'

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
})

export async function getDeveloper(username) {
  const { data } = await githubApi.get(`/users/${encodeURIComponent(username)}`)
  return data
}

export async function getRepositories(username) {
  const { data } = await githubApi.get(
    `/users/${encodeURIComponent(username)}/repos`,
    {
      params: {
        sort: 'updated',
        per_page: 100,
        type: 'owner',
      },
    }
  )

  return data
}
