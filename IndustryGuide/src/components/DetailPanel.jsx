import { useState } from 'react';
import { Bookmark, BookOpen, Briefcase, ChevronRight, Star, MapPin, TrendingUp, Target, GraduationCap, BookMarked, Award, Layers, Building2 } from 'lucide-react';
const CATEGORY_LABEL = {
 middleSchoolSubjects: '中学学科',
 universityMajors: '大学专业',
 industries: '工作行业'
};
const CATEGORY_COLOR = {
 middleSchoolSubjects: '#667eea',
 universityMajors: '#f093fb',
 industries: '#4ade80'
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
function DetailPanel({ item, category, isFavorited, onToggleFavorite, relatedItems, subjects, majors, industries }) {
 const [activeTab, setActiveTab] = useState('overview');
 if (!item) {
 return (<div className="detail-panel empty">
 <div className="empty-content">
 <Briefcase size={48} className="empty-icon"/>
 <h3>选择一个节点查看详情</h3>
 <p>点击图谱中的任意节点，查看该学科、专业或行业的详细信息</p>
 </div>
 </div>);
 }
 const tabs = [
 { id: 'overview', label: '概览', icon: Layers },
 { id: 'prospect', label: '发展前景', icon: TrendingUp },
 { id: 'skills', label: '技能要求', icon: Target },
 { id: 'learning', label: '学习路径', icon: GraduationCap },
 { id: 'related', label: '关联关系', icon: ChevronRight },
 ];
 const renderOverview = () => (<div className="tab-content">
 <div className="overview-header">
 <div className="category-badge" style={{ backgroundColor: CATEGORY_COLOR[category] }}>
 {CATEGORY_LABEL[category]}
 </div>
 <button className={`favorite-btn ${isFavorited ? 'favorited' : ''}`} onClick={() => onToggleFavorite(item.id)}>
 <Bookmark size={20} fill={isFavorited ? '#fbbf24' : 'none'}/>
 <span>{isFavorited ? '已收藏' : '收藏'}</span>
 </button>
 </div>
 <h2 className="item-title">{item.name}</h2>
 {item.description && (<p className="item-description">{item.description}</p>)}
 </div>);
 const renderProspect = () => {
 if (!item.prospect) return null;
 const { salary, marketDemand, growthTrend, description } = item.prospect;
 return (<div className="tab-content">
 <div className="section-header">
 <TrendingUp size={20}/>
 <h3>发展前景</h3>
 </div>
 
 {description && (<p className="prospect-desc">{description}</p>)}
 
 <div className="salary-section">
 <h4 className="section-title">薪资水平（按城市等级）</h4>
 <div className="salary-grid">
 <div className="salary-card">
 <div className="salary-header">
 <MapPin size={16}/>
 <span>一线城市</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">起薪</span>
 <span className="salary-value">{salary?.firstTier?.entry}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">中期</span>
 <span className="salary-value">{salary?.firstTier?.mid}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">资深</span>
 <span className="salary-value">{salary?.firstTier?.senior}</span>
 </div>
 </div>
 
 <div className="salary-card">
 <div className="salary-header">
 <MapPin size={16}/>
 <span>二线城市</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">起薪</span>
 <span className="salary-value">{salary?.secondTier?.entry}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">中期</span>
 <span className="salary-value">{salary?.secondTier?.mid}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">资深</span>
 <span className="salary-value">{salary?.secondTier?.senior}</span>
 </div>
 </div>
 
 <div className="salary-card">
 <div className="salary-header">
 <MapPin size={16}/>
 <span>三线城市</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">起薪</span>
 <span className="salary-value">{salary?.thirdTier?.entry}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">中期</span>
 <span className="salary-value">{salary?.thirdTier?.mid}</span>
 </div>
 <div className="salary-item">
 <span className="salary-label">资深</span>
 <span className="salary-value">{salary?.thirdTier?.senior}</span>
 </div>
 </div>
 </div>
 </div>
 
 <div className="indicators">
 <div className="indicator">
 <span className="indicator-label">市场需求</span>
 <span className="indicator-value" style={{ color: DEMAND_COLOR[marketDemand] }}>
 {marketDemand}
 </span>
 </div>
 <div className="indicator">
 <span className="indicator-label">增长趋势</span>
 <span className="indicator-value" style={{ color: TREND_COLOR[growthTrend] }}>
 {growthTrend}
 </span>
 </div>
 </div>
 </div>);
 };
 const renderSkills = () => {
 if (!item.skills) return null;
 const { core, soft } = item.skills;
 return (<div className="tab-content">
 <div className="section-header">
 <Target size={20}/>
 <h3>技能要求</h3>
 </div>
 
 <div className="skills-section">
 <div className="skills-category">
 <h4>核心技能</h4>
 <div className="skills-grid">
 {core?.map((skill, index) => (<span key={index} className="skill-tag core">{skill}</span>))}
 </div>
 </div>
 
 <div className="skills-category">
 <h4>软技能</h4>
 <div className="skills-grid">
 {soft?.map((skill, index) => (<span key={index} className="skill-tag soft">{skill}</span>))}
 </div>
 </div>
 </div>
 </div>);
 };
 const renderLearningPath = () => {
 if (!item.learningPath) return null;
 const { courses, books, resources, projects, certifications } = item.learningPath;
 return (<div className="tab-content">
 <div className="section-header">
 <GraduationCap size={20}/>
 <h3>学习路径</h3>
 </div>
 
 {courses && courses.length > 0 && (<div className="learning-section">
 <h4 className="learning-title">
 <BookMarked size={16}/>
 核心课程
 </h4>
 <ul className="learning-list">
 {courses.map((course, index) => (<li key={index}>{course}</li>))}
 </ul>
 </div>)}
 
 {books && books.length > 0 && (<div className="learning-section">
 <h4 className="learning-title">
 <BookOpen size={16}/>
 推荐书籍
 </h4>
 <ul className="learning-list">
 {books.map((book, index) => (<li key={index}>{book}</li>))}
 </ul>
 </div>)}
 
 {resources && resources.length > 0 && (<div className="learning-section">
 <h4 className="learning-title">
 <Star size={16}/>
 学习资源
 </h4>
 <div className="resources-grid">
 {resources.map((resource, index) => (<span key={index} className="resource-tag">{resource}</span>))}
 </div>
 </div>)}
 
 {projects && projects.length > 0 && (<div className="learning-section">
 <h4 className="learning-title">
 <Building2 size={16}/>
 实践项目
 </h4>
 <ul className="learning-list">
 {projects.map((project, index) => (<li key={index}>{project}</li>))}
 </ul>
 </div>)}
 
 {certifications && certifications.length > 0 && (<div className="learning-section">
 <h4 className="learning-title">
 <Award size={16}/>
 推荐认证
 </h4>
 <div className="resources-grid">
 {certifications.map((cert, index) => (<span key={index} className="resource-tag cert">{cert}</span>))}
 </div>
 </div>)}
 </div>);
 };
 const renderRelated = () => {
 return (<div className="tab-content">
 <div className="section-header">
 <ChevronRight size={20}/>
 <h3>关联关系</h3>
 </div>
 
 <div className="related-section">
 {category !== 'middleSchoolSubjects' && relatedItems.subjects?.length > 0 && (<div className="related-category">
 <h4>相关学科</h4>
 <div className="related-items">
 {relatedItems.subjects.map((subject) => (<div key={subject.id} className="related-item">
 <BookOpen size={16} style={{ color: CATEGORY_COLOR.middleSchoolSubjects }}/>
 <span>{subject.name}</span>
 </div>))}
 </div>
 </div>)}
 
 {category !== 'universityMajors' && relatedItems.majors?.length > 0 && (<div className="related-category">
 <h4>相关专业</h4>
 <div className="related-items">
 {relatedItems.majors.map((major) => (<div key={major.id} className="related-item">
 <GraduationCap size={16} style={{ color: CATEGORY_COLOR.universityMajors }}/>
 <span>{major.name}</span>
 </div>))}
 </div>
 </div>)}
 
 {category !== 'industries' && relatedItems.industries?.length > 0 && (<div className="related-category">
 <h4>相关行业</h4>
 <div className="related-items">
 {relatedItems.industries.map((industry) => (<div key={industry.id} className="related-item">
 <Briefcase size={16} style={{ color: CATEGORY_COLOR.industries }}/>
 <span>{industry.name}</span>
 </div>))}
 </div>
 </div>)}
 </div>
 </div>);
 };
 return (<div className="detail-panel">
 <div className="panel-tabs">
 {tabs.map((tab) => (<button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
 <tab.icon size={16}/>
 <span>{tab.label}</span>
 </button>))}
 </div>
 
 <div className="panel-content">
 {activeTab === 'overview' && renderOverview()}
 {activeTab === 'prospect' && renderProspect()}
 {activeTab === 'skills' && renderSkills()}
 {activeTab === 'learning' && renderLearningPath()}
 {activeTab === 'related' && renderRelated()}
 </div>
 </div>);
}
export default DetailPanel;
