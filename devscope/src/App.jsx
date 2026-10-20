
import { useState } from 'react'
import { Code2, Search, LayoutDashboard, GitCompare, Bookmark, Settings, Menu, X } from 'lucide-react'
import { getDeveloper, getRepositories } from './services/githubApi'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f472b6', '#64748b']

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon" style={{ color }}>
          <Icon size={19} />
        </span>
      </div>
      <h2>{value}</h2>
    </div>
  )
}

export default function App() {
  const [username, setUsername] = useState('octocat')
  const [query, setQuery] = useState('octocat')
  const [developer, setDeveloper] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sort, setSort] = useState('stars')

  async function searchDeveloper(event) {
    event?.preventDefault()
    const name = query.trim()
    if (!name) return

    setLoading(true)
    setError('')

    try {
      const [profile, repositories] = await Promise.all([
        getDeveloper(name),
        getRepositories(name),
      ])

      setDeveloper(profile)
      setRepos(repositories)
      setUsername(name)
    } catch (err) {
      setDeveloper(null)
      setRepos([])
      setError(
        err.response?.status === 404
          ? 'Developer not found. Check the username and try again.'
          : err.response?.status === 403
            ? 'Code2 API rate limit reached. Please try again later.'
            : 'Could not load Code2 data. Check your connection and retry.'
      )
    } finally {
      setLoading(false)
    }
  }

  const languageCounts = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1
    }
    return acc
  }, {})

  const languageData = Object.entries(languageCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const sortedRepos = [...repos].sort((a, b) => {
    if (sort === 'stars') return b.stargazers_count - a.stargazers_count
    if (sort === 'updated') return new Date(b.updated_at) - new Date(a.updated_at)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Code2 size={22} /></div>
          <span>dev<span className="brand-accent">scope</span></span>
          <button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="nav-menu">
          <a href="#dashboard" className="nav-item active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="#repositories" className="nav-item"><Code2 size={18} /> Repositories</a>
          <a href="#languages" className="nav-item"><GitCompare size={18} /> Languages</a>
          <a href="#saved" className="nav-item"><Bookmark size={18} /> Saved projects</a>
        </nav>

        <div className="sidebar-bottom">
          <Settings size={18} />
          <span>DevScope Analytics</span>
          <span className="online-dot" />
        </div>
      </aside>

      {mobileMenu && <button className="mobile-overlay" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div>
            <p className="eyebrow">DEVELOPER INTELLIGENCE</p>
            <h1>Dashboard <span className="breadcrumb">/ Overview</span></h1>
          </div>
          <div className="topbar-right">
            <span className="live-badge"><span className="online-dot" /> API CONNECTED</span>
            <div className="top-avatar">DS</div>
          </div>
        </header>

        <section className="welcome-row" id="dashboard">
          <div>
            <h2>Explore the developer universe.</h2>
            <p>Discover profiles, analyze repositories, and explore open-source projects.</p>
          </div>
          <form className="search-form" onSubmit={searchDeveloper}>
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter Code2 username..."
              aria-label="Code2 username"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Analyze'}
            </button>
          </form>
        </section>

        {error && <div className="error-banner" role="alert">{error}</div>}

        {!developer && !error && (
          <div className="panel loading-panel">
            <p>{loading ? 'Fetching Code2 profile...' : 'Loading demo developer...'}</p>
          </div>
        )}

        {developer && (
          <>
            <section className="profile-panel panel">
              <img className="profile-avatar" src={developer.avatar_url} alt={`${developer.login} avatar`} />
              <div className="profile-info">
                <div className="profile-name-row">
                  <h2>{developer.name || developer.login}</h2>
                  <span className="verified-pill">PUBLIC PROFILE</span>
                </div>
                <p className="username">@{developer.login}</p>
                <p className="profile-bio">{developer.bio || 'No public bio has been provided.'}</p>
                <div className="profile-meta">
                  {developer.location && <span>⌖ {developer.location}</span>}
                  <a href={developer.html_url} target="_blank" rel="noreferrer">View Code2 profile ↗</a>
                </div>
              </div>
              <div className="profile-joined">
                <span>PUBLIC SINCE</span>
                <strong>{new Date(developer.created_at).getFullYear()}</strong>
              </div>
            </section>

            <section className="stats-grid">
              <StatCard label="Public repositories" value={developer.public_repos} icon={Code2} color="#a78bfa" />
              <StatCard label="Followers" value={developer.followers.toLocaleString()} icon={GitCompare} color="#22d3ee" />
              <StatCard label="Following" value={developer.following.toLocaleString()} icon={Bookmark} color="#fbbf24" />
              <StatCard label="Total stars found" value={repos.reduce((sum, repo) => sum + repo.stargazers_count, 0).toLocaleString()} icon={Search} color="#34d399" />
            </section>

            <section className="analytics-grid">
              <div className="panel chart-panel" id="languages">
                <div className="panel-heading">
                  <div><h3>Language distribution</h3><p>Based on loaded repositories</p></div>
                  <span className="heading-icon">◉</span>
                </div>
                {languageData.length ? (
                  <>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={4}>
                            {languageData.map((item, index) => (
                              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #30394a', borderRadius: 10 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="language-legend">
                      {languageData.map((item, index) => (
                        <div key={item.name} className="legend-item">
                          <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
                          <span>{item.name}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="empty-state">No language data is available.</p>}
              </div>

              <div className="panel repos-panel" id="repositories">
                <div className="panel-heading">
                  <div><h3>Repositories</h3><p>{repos.length} repositories loaded</p></div>
                  <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort repositories">
                    <option value="stars">Most stars</option>
                    <option value="updated">Recently updated</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>

                <div className="repo-list">
                  {sortedRepos.slice(0, 8).map((repo) => (
                    <article className="repo-row" key={repo.id}>
                      <div className="repo-icon"><Code2 size={18} /></div>
                      <div className="repo-details">
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-name">{repo.name}</a>
                        <p>{repo.description || 'No description provided.'}</p>
                        <div className="repo-meta">
                          {repo.language && <span><i className="language-dot" />{repo.language}</span>}
                          <span>★ {repo.stargazers_count}</span>
                          <span>⑂ {repo.forks_count}</span>
                        </div>
                      </div>
                      <a className="repo-open" href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name} on Code2`}>↗</a>
                    </article>
                  ))}
                </div>
              </div>
            </section>
            <p className="footer-note">Data provided by Code2's public API · Repository results may be limited by API pagination.</p>
          </>
        )}
      </main>
    </div>
  )
}
