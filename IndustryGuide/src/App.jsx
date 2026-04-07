import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './App.css'

const CATEGORY_LABEL = {
  middleSchoolSubjects: '中学学科',
  universityMajors: '大学专业',
  industries: '工作行业'
}

/** 根据选中项计算 1 跳邻居（完整对象），用于局部关系视图 */
function getLocalNeighbors(selectedItem, data) {
  if (!selectedItem || !data.middleSchoolSubjects?.length) {
    return { subjects: [], majors: [], industries: [] }
  }

  const { id, category } = selectedItem

  if (category === 'middleSchoolSubjects') {
    const subject = data.middleSchoolSubjects.find((s) => s.id === id)
    if (!subject) return { subjects: [], majors: [], industries: [] }
    const majors = subject.relatedMajors
      .map((mid) => data.universityMajors.find((m) => m.id === mid))
      .filter(Boolean)
    const industries = subject.relatedIndustries
      .map((iid) => data.industries.find((i) => i.id === iid))
      .filter(Boolean)
    return { subjects: [], majors, industries }
  }

  if (category === 'universityMajors') {
    const major = data.universityMajors.find((m) => m.id === id)
    if (!major) return { subjects: [], majors: [], industries: [] }
    const subjects = major.relatedSubjects
      .map((sid) => data.middleSchoolSubjects.find((s) => s.id === sid))
      .filter(Boolean)
    const industries = major.relatedIndustries
      .map((iid) => data.industries.find((i) => i.id === iid))
      .filter(Boolean)
    return { subjects, majors: [], industries }
  }

  if (category === 'industries') {
    const industry = data.industries.find((i) => i.id === id)
    if (!industry) return { subjects: [], majors: [], industries: [] }
    const subjects = industry.relatedSubjects
      .map((sid) => data.middleSchoolSubjects.find((s) => s.id === sid))
      .filter(Boolean)
    const majors = industry.relatedMajors
      .map((mid) => data.universityMajors.find((m) => m.id === mid))
      .filter(Boolean)
    return { subjects, majors, industries: [] }
  }

  return { subjects: [], majors: [], industries: [] }
}

function filterByName(items, query) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => item.name.toLowerCase().includes(q))
}

function App() {
  const [data, setData] = useState({
    middleSchoolSubjects: [],
    universityMajors: [],
    industries: []
  })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrollKey, setScrollKey] = useState(0)
  const canvasRef = useRef(null)
  const focusVisualRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setLoadError('')
        const [subjectsRes, majorsRes, industriesRes] = await Promise.all([
          fetch('/data/middleSchoolSubjects.json'),
          fetch('/data/universityMajors.json'),
          fetch('/data/industries.json')
        ])

        if (!subjectsRes.ok || !majorsRes.ok || !industriesRes.ok) {
          throw new Error('数据文件加载失败')
        }

        const [middleSchoolSubjects, universityMajors, industries] = await Promise.all([
          subjectsRes.json(),
          majorsRes.json(),
          industriesRes.json()
        ])

        setData({ middleSchoolSubjects, universityMajors, industries })
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : '数据加载失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredSubjects = useMemo(
    () => filterByName(data.middleSchoolSubjects, searchQuery),
    [data.middleSchoolSubjects, searchQuery]
  )
  const filteredMajors = useMemo(
    () => filterByName(data.universityMajors, searchQuery),
    [data.universityMajors, searchQuery]
  )
  const filteredIndustries = useMemo(
    () => filterByName(data.industries, searchQuery),
    [data.industries, searchQuery]
  )

  const localNeighbors = useMemo(
    () => getLocalNeighbors(selectedItem, data),
    [selectedItem, data]
  )

  const handleItemClick = useCallback((item, category) => {
    setSelectedItem({ ...item, category })
  }, [])

  const handleBrowseScroll = () => {
    setScrollKey((k) => k + 1)
  }

  const handleFocusScroll = () => {
    setScrollKey((k) => k + 1)
  }

  // 仅在「局部关系区」内绘制：中心 → 各邻居（避免全表交叉连线）
  useEffect(() => {
    const canvas = canvasRef.current
    const container = focusVisualRef.current
    if (!canvas || !container || !selectedItem) {
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const hub = container.querySelector('.focus-hub')
    if (!hub) return

    const hubRect = hub.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()
    const hubCx = (hubRect.left + hubRect.right) / 2 - cRect.left
    const hubCy = (hubRect.top + hubRect.bottom) / 2 - cRect.top

    const targets = container.querySelectorAll('.focus-neighbor-item')
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.55)'

    targets.forEach((el) => {
      const r = el.getBoundingClientRect()
      const tx = (r.left + r.right) / 2 - cRect.left
      const ty = (r.top + r.bottom) / 2 - cRect.top

      ctx.beginPath()
      ctx.moveTo(hubCx, hubCy)
      ctx.lineTo(tx, ty)
      ctx.stroke()
    })
  }, [selectedItem, localNeighbors, scrollKey, data])

  useEffect(() => {
    const onResize = () => setScrollKey((k) => k + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (loading) {
    return (
      <div className="app">
        <h1>学科-专业-行业关系图</h1>
        <p className="app-status">正在加载数据...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="app">
        <h1>学科-专业-行业关系图</h1>
        <p className="app-status">数据加载失败: {loadError}</p>
      </div>
    )
  }

  return (
    <div className="app app-layout">
      <header className="app-header">
        <h1>学科-专业-行业关系图</h1>
        <p className="app-subtitle">左侧浏览全部条目；右侧以选中项为中心展示直接关联</p>
      </header>

      <div className="main-split">
        {/* 浏览侧：搜索 + 全量列表 */}
        <aside className="browse-panel" onScroll={handleBrowseScroll}>
          <div className="browse-search">
            <label htmlFor="browse-q">搜索</label>
            <input
              id="browse-q"
              type="search"
              placeholder="按名称筛选…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <section className="browse-section">
            <h3>中学学科</h3>
            <div className="browse-list">
              {filteredSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  className={`browse-item ${selectedItem?.id === subject.id && selectedItem?.category === 'middleSchoolSubjects' ? 'is-selected' : ''}`}
                  onClick={() => handleItemClick(subject, 'middleSchoolSubjects')}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </section>

          <section className="browse-section">
            <h3>大学专业</h3>
            <div className="browse-list">
              {filteredMajors.map((major) => (
                <button
                  key={major.id}
                  type="button"
                  className={`browse-item ${selectedItem?.id === major.id && selectedItem?.category === 'universityMajors' ? 'is-selected' : ''}`}
                  onClick={() => handleItemClick(major, 'universityMajors')}
                >
                  {major.name}
                </button>
              ))}
            </div>
          </section>

          <section className="browse-section">
            <h3>工作行业</h3>
            <div className="browse-list">
              {filteredIndustries.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  className={`browse-item ${selectedItem?.id === industry.id && selectedItem?.category === 'industries' ? 'is-selected' : ''}`}
                  onClick={() => handleItemClick(industry, 'industries')}
                >
                  {industry.name}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* 焦点侧：以选中项为中心的局部关系 */}
        <main className="focus-panel">
          {!selectedItem ? (
            <div className="focus-empty">
              <p>请在左侧选择一个学科、专业或行业</p>
              <p className="focus-empty-hint">右侧将只显示与该条目的<strong>直接关联</strong>，并用连线标出关系方向</p>
            </div>
          ) : (
            <div
              className="focus-visual"
              ref={focusVisualRef}
              onScroll={handleFocusScroll}
            >
              <canvas ref={canvasRef} className="focus-canvas" aria-hidden />

              <div className="focus-hub-wrap">
                <div className="focus-hub-label">当前选中</div>
                <div className="focus-hub" data-hub="1">
                  <span className="focus-hub-type">{CATEGORY_LABEL[selectedItem.category]}</span>
                  <span className="focus-hub-name">{selectedItem.name}</span>
                </div>
              </div>

              <div className="focus-neighbor-row" onScroll={handleFocusScroll}>
                <div className="focus-neighbor-zone">
                  <h4>相关学科</h4>
                  <div className="focus-neighbor-list">
                    {localNeighbors.subjects.length === 0 ? (
                      <p className="focus-zone-empty">
                        {selectedItem.category === 'middleSchoolSubjects'
                          ? '当前为学科，左侧无「相关学科」；请看专业与行业两列'
                          : '暂无直接关联学科'}
                      </p>
                    ) : (
                      localNeighbors.subjects.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="focus-neighbor-item"
                          data-id={s.id}
                          onClick={() => handleItemClick(s, 'middleSchoolSubjects')}
                        >
                          {s.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="focus-neighbor-zone">
                  <h4>相关专业</h4>
                  <div className="focus-neighbor-list">
                    {localNeighbors.majors.length === 0 ? (
                      <p className="focus-zone-empty">
                        {selectedItem.category === 'universityMajors'
                          ? '当前即为专业；请看「相关学科」与「相关行业」'
                          : '暂无直接关联专业'}
                      </p>
                    ) : (
                      localNeighbors.majors.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className="focus-neighbor-item"
                          data-id={m.id}
                          onClick={() => handleItemClick(m, 'universityMajors')}
                        >
                          {m.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="focus-neighbor-zone">
                  <h4>相关行业</h4>
                  <div className="focus-neighbor-list">
                    {localNeighbors.industries.length === 0 ? (
                      <p className="focus-zone-empty">
                        {selectedItem.category === 'industries'
                          ? '当前为行业；请看「相关学科」与「相关专业」'
                          : '暂无直接关联行业'}
                      </p>
                    ) : (
                      localNeighbors.industries.map((i) => (
                        <button
                          key={i.id}
                          type="button"
                          className="focus-neighbor-item"
                          data-id={i.id}
                          onClick={() => handleItemClick(i, 'industries')}
                        >
                          {i.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <p className="focus-tip">点击邻居可切换为中心，继续查看其局部关系</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
