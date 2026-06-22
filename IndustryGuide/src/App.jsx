import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Bookmark, BookOpen, Briefcase, ChevronRight, Heart, Search, Layers, GraduationCap, Building2, Star, Network, TrendingUp } from 'lucide-react';
import './App.css';
import TreeView from './components/TreeView';

const SUBJECT_COLOR = '#667eea';
const MAJOR_COLOR = '#f093fb';
const INDUSTRY_COLOR = '#4ade80';

function SubjectNode({ data, isFavorited, onClick }) {
  return (
    <div
      className={`custom-node subject-node ${isFavorited ? 'favorited' : ''}`}
      onClick={onClick}
    >
      <BookOpen size={14} />
      <span>{data.label}</span>
      {isFavorited && (
        <Heart size={12} className="favorite-icon" />
      )}
    </div>
  );
}

function MajorNode({ data, isFavorited, onClick }) {
  return (
    <div
      className={`custom-node major-node ${isFavorited ? 'favorited' : ''}`}
      onClick={onClick}
    >
      <GraduationCap size={14} />
      <span>{data.label}</span>
      {isFavorited && (
        <Heart size={12} className="favorite-icon" />
      )}
    </div>
  );
}

function IndustryNode({ data, isFavorited, onClick }) {
  return (
    <div
      className={`custom-node industry-node ${isFavorited ? 'favorited' : ''}`}
      onClick={onClick}
    >
      <Building2 size={14} />
      <span>{data.label}</span>
      {isFavorited && (
        <Heart size={12} className="favorite-icon" />
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState({
    middleSchoolSubjects: [],
    universityMajors: [],
    industries: []
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favoritedItems, setFavoritedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('graph'); // 'graph' or 'tree'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const saved = localStorage.getItem('favoritedItems');
    if (saved) {
      setFavoritedItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoritedItems', JSON.stringify(favoritedItems));
  }, [favoritedItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [subjectsRes, majorsRes, industriesRes] = await Promise.all([
          fetch('/data/middleSchoolSubjects.json'),
          fetch('/data/universityMajors.json'),
          fetch('/data/industries.json')
        ]);

        if (!subjectsRes.ok || !majorsRes.ok || !industriesRes.ok) {
          throw new Error('数据文件加载失败');
        }

        const [middleSchoolSubjects, universityMajors, industries] = await Promise.all([
          subjectsRes.json(),
          majorsRes.json(),
          industriesRes.json()
        ]);

        setData({ middleSchoolSubjects, universityMajors, industries });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : '数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleFavorite = useCallback((itemId) => {
    setFavoritedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const getRelatedItems = useMemo(() => {
    if (!selectedItem || !selectedCategory) {
      return { subjects: [], majors: [], industries: [] };
    }

    const { id } = selectedItem;

    if (selectedCategory === 'middleSchoolSubjects') {
      const subject = data.middleSchoolSubjects.find(s => s.id === id);
      if (!subject) return { subjects: [], majors: [], industries: [] };
      const majors = subject.relatedMajors?.map(mid => data.universityMajors.find(m => m.id === mid)).filter(Boolean) || [];
      const industries = subject.relatedIndustries?.map(iid => data.industries.find(i => i.id === iid)).filter(Boolean) || [];
      return { subjects: [], majors, industries };
    }

    if (selectedCategory === 'universityMajors') {
      const major = data.universityMajors.find(m => m.id === id);
      if (!major) return { subjects: [], majors: [], industries: [] };
      const subjects = major.relatedSubjects?.map(sid => data.middleSchoolSubjects.find(s => s.id === sid)).filter(Boolean) || [];
      const industries = major.relatedIndustries?.map(iid => data.industries.find(i => i.id === iid)).filter(Boolean) || [];
      return { subjects, majors: [], industries };
    }

    if (selectedCategory === 'industries') {
      const industry = data.industries.find(i => i.id === id);
      if (!industry) return { subjects: [], majors: [], industries: [] };
      const subjects = industry.relatedSubjects?.map(sid => data.middleSchoolSubjects.find(s => s.id === sid)).filter(Boolean) || [];
      const majors = industry.relatedMajors?.map(mid => data.universityMajors.find(m => m.id === mid)).filter(Boolean) || [];
      return { subjects, majors, industries: [] };
    }

    return { subjects: [], majors: [], industries: [] };
  }, [selectedItem, selectedCategory, data]);

  const handleItemSelect = useCallback((item, category) => {
    // 处理 TreeView 组件传递的类型名称
    let normalizedCategory = category;
    if (category === 'subject') normalizedCategory = 'middleSchoolSubjects';
    if (category === 'major') normalizedCategory = 'universityMajors';
    if (category === 'industry') normalizedCategory = 'industries';
    
    setSelectedItem(item);
    setSelectedCategory(normalizedCategory);
  }, []);

  const filteredSubjects = useMemo(
    () => data.middleSchoolSubjects.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [data.middleSchoolSubjects, searchQuery]
  );

  const filteredMajors = useMemo(
    () => data.universityMajors.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [data.universityMajors, searchQuery]
  );

  const filteredIndustries = useMemo(
    () => data.industries.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [data.industries, searchQuery]
  );

  const generateNodes = useMemo(() => {
    const nodes = [];
    
    // 如果没有选中节点，返回空数组
    if (!selectedItem || !selectedCategory) {
      return nodes;
    }

    const centerX = 400;
    const centerY = 300;
    const leftX = 120;
    const rightX = 680;
    const nodeSpacing = 70;

    // 根据选中节点的类型生成不同的布局
    if (selectedCategory === 'universityMajors') {
      // 选中的是专业：专业在中心，学科在左侧，行业在右侧
      const relatedSubjects = selectedItem.relatedSubjects
        ?.map(sid => data.middleSchoolSubjects.find(s => s.id === sid))
        .filter(Boolean) || [];
      
      const relatedIndustries = selectedItem.relatedIndustries
        ?.map(iid => data.industries.find(i => i.id === iid))
        .filter(Boolean) || [];

      // 中心节点：选中的专业
      nodes.push({
        id: selectedItem.id,
        type: 'major',
        position: { x: centerX, y: centerY },
        data: { label: selectedItem.name, item: selectedItem, category: 'universityMajors' },
        width: 150,
        height: 40,
      });

      // 左侧：相关学科
      const subjectStartY = centerY - ((relatedSubjects.length - 1) * nodeSpacing) / 2;
      relatedSubjects.forEach((subject, index) => {
        nodes.push({
          id: subject.id,
          type: 'subject',
          position: { x: leftX, y: subjectStartY + index * nodeSpacing },
          data: { label: subject.name, item: subject, category: 'middleSchoolSubjects' },
          width: 100,
          height: 36,
        });
      });

      // 右侧：相关行业
      const industryStartY = centerY - ((relatedIndustries.length - 1) * nodeSpacing) / 2;
      relatedIndustries.forEach((industry, index) => {
        nodes.push({
          id: industry.id,
          type: 'industry',
          position: { x: rightX, y: industryStartY + index * nodeSpacing },
          data: { label: industry.name, item: industry, category: 'industries' },
          width: 130,
          height: 36,
        });
      });
    } else if (selectedCategory === 'middleSchoolSubjects') {
      // 选中的是学科：学科在中心，相关专业在右侧
      const relatedMajors = data.universityMajors.filter(major =>
        major.relatedSubjects?.includes(selectedItem.id)
      );

      // 中心节点：选中的学科
      nodes.push({
        id: selectedItem.id,
        type: 'subject',
        position: { x: centerX, y: centerY },
        data: { label: selectedItem.name, item: selectedItem, category: 'middleSchoolSubjects' },
        width: 100,
        height: 36,
      });

      // 右侧：相关专业
      const majorStartY = centerY - ((relatedMajors.length - 1) * nodeSpacing) / 2;
      relatedMajors.forEach((major, index) => {
        nodes.push({
          id: major.id,
          type: 'major',
          position: { x: rightX, y: majorStartY + index * nodeSpacing },
          data: { label: major.name, item: major, category: 'universityMajors' },
          width: 150,
          height: 40,
        });
      });
    } else if (selectedCategory === 'industries') {
      // 选中的是行业：行业在中心，相关专业在左侧
      const relatedMajors = data.universityMajors.filter(major =>
        major.relatedIndustries?.includes(selectedItem.id)
      );

      // 中心节点：选中的行业
      nodes.push({
        id: selectedItem.id,
        type: 'industry',
        position: { x: centerX, y: centerY },
        data: { label: selectedItem.name, item: selectedItem, category: 'industries' },
        width: 130,
        height: 36,
      });

      // 左侧：相关专业
      const majorStartY = centerY - ((relatedMajors.length - 1) * nodeSpacing) / 2;
      relatedMajors.forEach((major, index) => {
        nodes.push({
          id: major.id,
          type: 'major',
          position: { x: leftX, y: majorStartY + index * nodeSpacing },
          data: { label: major.name, item: major, category: 'universityMajors' },
          width: 150,
          height: 40,
        });
      });
    }

    return nodes;
  }, [selectedItem, selectedCategory, data]);

  const generateEdges = useMemo(() => {
    const edges = [];
    
    if (!selectedItem || !selectedCategory) {
      return edges;
    }

    let edgeId = 0;

    if (selectedCategory === 'universityMajors') {
      selectedItem.relatedSubjects?.forEach((subjectId) => {
        edges.push({
          id: `e${edgeId++}`,
          source: subjectId,
          target: selectedItem.id,
          animated: true,
          style: { stroke: '#667eea', strokeWidth: 3 },
        });
      });

      selectedItem.relatedIndustries?.forEach((industryId) => {
        edges.push({
          id: `e${edgeId++}`,
          source: selectedItem.id,
          target: industryId,
          animated: true,
          style: { stroke: '#f093fb', strokeWidth: 3 },
        });
      });
    } else if (selectedCategory === 'middleSchoolSubjects') {
      const relatedMajors = data.universityMajors.filter(major =>
        major.relatedSubjects?.includes(selectedItem.id)
      );
      
      relatedMajors.forEach((major) => {
        edges.push({
          id: `e${edgeId++}`,
          source: selectedItem.id,
          target: major.id,
          animated: true,
          style: { stroke: '#667eea', strokeWidth: 3 },
        });
      });
    } else if (selectedCategory === 'industries') {
      const relatedMajors = data.universityMajors.filter(major =>
        major.relatedIndustries?.includes(selectedItem.id)
      );
      
      relatedMajors.forEach((major) => {
        edges.push({
          id: `e${edgeId++}`,
          source: major.id,
          target: selectedItem.id,
          animated: true,
          style: { stroke: '#f093fb', strokeWidth: 3 },
        });
      });
    }

    return edges;
  }, [selectedItem, selectedCategory, data]);

  const nodeTypes = useMemo(() => ({
    subject: ({ data }) => (
      <SubjectNode
        data={data}
        isFavorited={favoritedItems.includes(data.item.id)}
        onClick={() => handleItemSelect(data.item, data.category)}
      />
    ),
    major: ({ data }) => (
      <MajorNode
        data={data}
        isFavorited={favoritedItems.includes(data.item.id)}
        onClick={() => handleItemSelect(data.item, data.category)}
      />
    ),
    industry: ({ data }) => (
      <IndustryNode
        data={data}
        isFavorited={favoritedItems.includes(data.item.id)}
        onClick={() => handleItemSelect(data.item, data.category)}
      />
    ),
  }), [favoritedItems, handleItemSelect]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-error">
        <p>数据加载失败: {loadError}</p>
      </div>
    );
  }

  const CATEGORY_LABEL = {
    middleSchoolSubjects: '中学学科',
    universityMajors: '大学专业',
    industries: '工作行业'
  };

  const CATEGORY_COLOR_MAP = {
    middleSchoolSubjects: SUBJECT_COLOR,
    universityMajors: MAJOR_COLOR,
    industries: INDUSTRY_COLOR
  };

  const DEMAND_COLOR = {
    '紧缺': '#ef4444',
    '增长': '#22c55e',
    '平稳': '#f59e0b',
    '稳定': '#3b82f6'
  };

  const TREND_COLOR = {
    '快速增长': '#22c55e',
    '爆发式增长': '#ef4444',
    '增长': '#10b981',
    '平稳': '#f59e0b',
    '稳定': '#3b82f6'
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Layers size={32} />
            <h1>职涯图谱</h1>
          </div>
          <p className="subtitle">探索学科、专业与职业的无限可能</p>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="搜索学科、专业或行业..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {favoritedItems.length > 0 && (
            <div className="favorites-section">
              <h3 className="section-title">
                <Star size={16} className="star-icon" />
                我的收藏 ({favoritedItems.length})
              </h3>
              <div className="favorites-list">
                {favoritedItems.map(id => {
                  const subject = data.middleSchoolSubjects.find(s => s.id === id);
                  if (subject) return { ...subject, category: 'middleSchoolSubjects' };
                  const major = data.universityMajors.find(m => m.id === id);
                  if (major) return { ...major, category: 'universityMajors' };
                  const industry = data.industries.find(i => i.id === id);
                  if (industry) return { ...industry, category: 'industries' };
                  return null;
                }).filter(Boolean).map(item => (
                  <button
                    key={item.id}
                    className="favorite-item"
                    style={{ borderLeftColor: CATEGORY_COLOR_MAP[item.category] }}
                    onClick={() => handleItemSelect(item, item.category)}
                  >
                    <span className="favorite-name">{item.name}</span>
                    <button 
                      className="remove-favorite"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                    >
                      <Bookmark size={14} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="browse-section">
            <h3 className="section-title">
              <BookOpen size={16} />
              中学学科 ({filteredSubjects.length})
            </h3>
            <div className="browse-list">
              {filteredSubjects.map(subject => (
                <button
                  key={subject.id}
                  className={`browse-item ${selectedItem?.id === subject.id && selectedCategory === 'middleSchoolSubjects' ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(subject, 'middleSchoolSubjects')}
                >
                  {subject.name}
                  {favoritedItems.includes(subject.id) && <Heart size={14} className="mini-heart" />}
                </button>
              ))}
            </div>
          </div>

          <div className="browse-section">
            <h3 className="section-title">
              <GraduationCap size={16} />
              大学专业 ({filteredMajors.length})
            </h3>
            <div className="browse-list">
              {filteredMajors.map(major => (
                <button
                  key={major.id}
                  className={`browse-item ${selectedItem?.id === major.id && selectedCategory === 'universityMajors' ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(major, 'universityMajors')}
                >
                  {major.name}
                  {favoritedItems.includes(major.id) && <Heart size={14} className="mini-heart" />}
                </button>
              ))}
            </div>
          </div>

          <div className="browse-section">
            <h3 className="section-title">
              <Building2 size={16} />
              工作行业 ({filteredIndustries.length})
            </h3>
            <div className="browse-list">
              {filteredIndustries.map(industry => (
                <button
                  key={industry.id}
                  className={`browse-item ${selectedItem?.id === industry.id && selectedCategory === 'industries' ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(industry, 'industries')}
                >
                  {industry.name}
                  {favoritedItems.includes(industry.id) && <Heart size={14} className="mini-heart" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="graph-container">
          <div className="graph-header">
            <div className="view-switcher">
              <button 
                className={`view-btn ${viewType === 'graph' ? 'active' : ''}`}
                onClick={() => setViewType('graph')}
              >
                <Network size={18} />
                <span>图谱视图</span>
              </button>
              <button 
                className={`view-btn ${viewType === 'tree' ? 'active' : ''}`}
                onClick={() => setViewType('tree')}
              >
                <TrendingUp size={18} />
                <span>树形视图</span>
              </button>
            </div>
            {viewType === 'graph' && (
              <div className="legend">
                <span className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: SUBJECT_COLOR }}></span>
                  <span>中学学科</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: MAJOR_COLOR }}></span>
                  <span>大学专业</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: INDUSTRY_COLOR }}></span>
                  <span>工作行业</span>
                </span>
              </div>
            )}
          </div>
          
          {viewType === 'graph' ? (
            <ReactFlow
              nodes={generateNodes}
              edges={generateEdges}
              nodeTypes={nodeTypes}
              fitView
              className="react-flow"
            >
              <Background />
              <Controls />
            </ReactFlow>
          ) : (
            <TreeView
              subjects={filteredSubjects}
              majors={filteredMajors}
              industries={filteredIndustries}
              selectedItem={selectedItem}
              onSelectItem={handleItemSelect}
            />
          )}
        </div>

        <div className="detail-panel">
          {!selectedItem ? (
            <div className="empty-panel">
              <Layers size={64} className="empty-icon" />
              <h2>选择一个节点</h2>
              <p>点击左侧列表或视图中的节点，查看详细信息</p>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <div className="detail-category" style={{ backgroundColor: CATEGORY_COLOR_MAP[selectedCategory] }}>
                  {CATEGORY_LABEL[selectedCategory]}
                </div>
                <button 
                  className={`favorite-btn ${favoritedItems.includes(selectedItem.id) ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(selectedItem.id)}
                >
                  <Heart size={18} />
                  <span>{favoritedItems.includes(selectedItem.id) ? '已收藏' : '收藏'}</span>
                </button>
              </div>

              <h1 className="detail-title">{selectedItem.name}</h1>
              {selectedItem.description && (
                <p className="detail-description">{selectedItem.description}</p>
              )}

              <div className="detail-tabs">
                <button 
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  概览
                </button>
                <button 
                  className={`tab ${activeTab === 'prospect' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prospect')}
                >
                  发展前景
                </button>
                <button 
                  className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setActiveTab('skills')}
                >
                  技能要求
                </button>
                <button 
                  className={`tab ${activeTab === 'learning' ? 'active' : ''}`}
                  onClick={() => setActiveTab('learning')}
                >
                  学习路径
                </button>
                <button 
                  className={`tab ${activeTab === 'related' ? 'active' : ''}`}
                  onClick={() => setActiveTab('related')}
                >
                  关联关系
                </button>
              </div>

              <div className="detail-content">
                <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
                  <div className="overview-grid">
                    <div className="overview-card">
                      <div className="card-icon" style={{ backgroundColor: `${CATEGORY_COLOR_MAP[selectedCategory]}20` }}>
                        <Layers size={24} style={{ color: CATEGORY_COLOR_MAP[selectedCategory] }} />
                      </div>
                      <div className="card-content">
                        <span className="card-label">分类</span>
                        <span className="card-value">{CATEGORY_LABEL[selectedCategory]}</span>
                      </div>
                    </div>
                    {selectedItem.prospect && (
                      <>
                        <div className="overview-card">
                          <div className="card-icon" style={{ backgroundColor: '#ef444420' }}>
                            <Star size={24} style={{ color: '#ef4444' }} />
                          </div>
                          <div className="card-content">
                            <span className="card-label">市场需求</span>
                            <span className="card-value" style={{ color: DEMAND_COLOR[selectedItem.prospect.marketDemand] }}>
                              {selectedItem.prospect.marketDemand}
                            </span>
                          </div>
                        </div>
                        <div className="overview-card">
                          <div className="card-icon" style={{ backgroundColor: '#22c55e20' }}>
                            <ChevronRight size={24} style={{ color: '#22c55e' }} />
                          </div>
                          <div className="card-content">
                            <span className="card-label">增长趋势</span>
                            <span className="card-value" style={{ color: TREND_COLOR[selectedItem.prospect.growthTrend] }}>
                              {selectedItem.prospect.growthTrend}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className={`tab-content ${activeTab === 'prospect' ? 'active' : ''}`} id="prospect">
                  {selectedItem.prospect && (
                    <>
                      {selectedItem.prospect.description && (
                        <p className="prospect-desc">{selectedItem.prospect.description}</p>
                      )}
                      <div className="salary-section">
                        <h3>薪资水平（按城市等级）</h3>
                        <div className="salary-grid">
                          {selectedItem.prospect.salary?.firstTier && (
                            <div className="salary-card">
                              <h4>一线城市</h4>
                              <div className="salary-item"><span>起薪</span><span>{selectedItem.prospect.salary.firstTier.entry}</span></div>
                              <div className="salary-item"><span>中期</span><span>{selectedItem.prospect.salary.firstTier.mid}</span></div>
                              <div className="salary-item"><span>资深</span><span>{selectedItem.prospect.salary.firstTier.senior}</span></div>
                            </div>
                          )}
                          {selectedItem.prospect.salary?.secondTier && (
                            <div className="salary-card">
                              <h4>二线城市</h4>
                              <div className="salary-item"><span>起薪</span><span>{selectedItem.prospect.salary.secondTier.entry}</span></div>
                              <div className="salary-item"><span>中期</span><span>{selectedItem.prospect.salary.secondTier.mid}</span></div>
                              <div className="salary-item"><span>资深</span><span>{selectedItem.prospect.salary.secondTier.senior}</span></div>
                            </div>
                          )}
                          {selectedItem.prospect.salary?.thirdTier && (
                            <div className="salary-card">
                              <h4>三线城市</h4>
                              <div className="salary-item"><span>起薪</span><span>{selectedItem.prospect.salary.thirdTier.entry}</span></div>
                              <div className="salary-item"><span>中期</span><span>{selectedItem.prospect.salary.thirdTier.mid}</span></div>
                              <div className="salary-item"><span>资深</span><span>{selectedItem.prospect.salary.thirdTier.senior}</span></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className={`tab-content ${activeTab === 'skills' ? 'active' : ''}`} id="skills">
                  {selectedItem.skills && (
                    <>
                      <div className="skills-category">
                        <h3>核心技能</h3>
                        <div className="skills-grid">
                          {selectedItem.skills.core?.map((skill, idx) => (
                            <span key={idx} className="skill-tag core">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="skills-category">
                        <h3>软技能</h3>
                        <div className="skills-grid">
                          {selectedItem.skills.soft?.map((skill, idx) => (
                            <span key={idx} className="skill-tag soft">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className={`tab-content ${activeTab === 'learning' ? 'active' : ''}`} id="learning">
                  {selectedItem.learningPath && (
                    <>
                      {selectedItem.learningPath.courses?.length > 0 && (
                        <div className="learning-section">
                          <h3>核心课程</h3>
                          <ul>
                            {selectedItem.learningPath.courses.map((course, idx) => (
                              <li key={idx}>{course}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedItem.learningPath.books?.length > 0 && (
                        <div className="learning-section">
                          <h3>推荐书籍</h3>
                          <ul>
                            {selectedItem.learningPath.books.map((book, idx) => (
                              <li key={idx}>{book}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedItem.learningPath.resources?.length > 0 && (
                        <div className="learning-section">
                          <h3>学习资源</h3>
                          <div className="resources-grid">
                            {selectedItem.learningPath.resources.map((resource, idx) => (
                              <span key={idx} className="resource-tag">{resource}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedItem.learningPath.projects?.length > 0 && (
                        <div className="learning-section">
                          <h3>实践项目</h3>
                          <ul>
                            {selectedItem.learningPath.projects.map((project, idx) => (
                              <li key={idx}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedItem.learningPath.certifications?.length > 0 && (
                        <div className="learning-section">
                          <h3>推荐认证</h3>
                          <div className="resources-grid">
                            {selectedItem.learningPath.certifications.map((cert, idx) => (
                              <span key={idx} className="resource-tag cert">{cert}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className={`tab-content ${activeTab === 'related' ? 'active' : ''}`} id="related">
                  {getRelatedItems.subjects.length > 0 && (
                    <div className="related-category">
                      <h3>相关学科</h3>
                      <div className="related-items">
                        {getRelatedItems.subjects.map(subject => (
                          <button
                            key={subject.id}
                            className="related-item"
                            onClick={() => handleItemSelect(subject, 'middleSchoolSubjects')}
                          >
                            <BookOpen size={16} />
                            <span>{subject.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {getRelatedItems.majors.length > 0 && (
                    <div className="related-category">
                      <h3>相关专业</h3>
                      <div className="related-items">
                        {getRelatedItems.majors.map(major => (
                          <button
                            key={major.id}
                            className="related-item"
                            onClick={() => handleItemSelect(major, 'universityMajors')}
                          >
                            <GraduationCap size={16} />
                            <span>{major.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {getRelatedItems.industries.length > 0 && (
                    <div className="related-category">
                      <h3>相关行业</h3>
                      <div className="related-items">
                        {getRelatedItems.industries.map(industry => (
                          <button
                            key={industry.id}
                            className="related-item"
                            onClick={() => handleItemSelect(industry, 'industries')}
                          >
                            <Building2 size={16} />
                            <span>{industry.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
