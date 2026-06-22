import { useCallback } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Controls, Background } from '@xyflow/react';
import { Bookmark, BookOpen, Briefcase, ChevronRight } from 'lucide-react';
const SUBJECT_COLOR = '#667eea';
const MAJOR_COLOR = '#f093fb';
const INDUSTRY_COLOR = '#4ade80';
const subjectNodeStyle = {
 background: SUBJECT_COLOR,
 color: 'white',
 borderRadius: '8px',
 padding: '8px 12px',
 fontSize: '12px',
 textAlign: 'center',
 boxShadow: `0 2px 8px ${SUBJECT_COLOR}40`,
};
const majorNodeStyle = {
 background: MAJOR_COLOR,
 color: 'white',
 borderRadius: '8px',
 padding: '8px 12px',
 fontSize: '12px',
 textAlign: 'center',
 boxShadow: `0 2px 8px ${MAJOR_COLOR}40`,
};
const industryNodeStyle = {
 background: INDUSTRY_COLOR,
 color: '#1f2937',
 borderRadius: '8px',
 padding: '8px 12px',
 fontSize: '12px',
 textAlign: 'center',
 boxShadow: `0 2px 8px ${INDUSTRY_COLOR}40`,
};
function SubjectNode({ data, isFavorited, onClick }) {
 return (<div className="custom-node" onClick={onClick} style={{
 ...subjectNodeStyle,
 cursor: 'pointer',
 border: isFavorited ? '2px solid #fbbf24' : 'none',
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
 <BookOpen size={14}/>
 <span style={{ fontWeight: '600' }}>{data.label}</span>
 </div>
 {isFavorited && (<div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
 <Bookmark size={16} fill="#fbbf24" color="#fbbf24"/>
 </div>)}
 </div>);
}
function MajorNode({ data, isFavorited, onClick }) {
 return (<div className="custom-node" onClick={onClick} style={{
 ...majorNodeStyle,
 cursor: 'pointer',
 border: isFavorited ? '2px solid #fbbf24' : 'none',
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
 <BookOpen size={14}/>
 <span style={{ fontWeight: '600' }}>{data.label}</span>
 </div>
 {isFavorited && (<div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
 <Bookmark size={16} fill="#fbbf24" color="#fbbf24"/>
 </div>)}
 </div>);
}
function IndustryNode({ data, isFavorited, onClick }) {
 return (<div className="custom-node" onClick={onClick} style={{
 ...industryNodeStyle,
 cursor: 'pointer',
 border: isFavorited ? '2px solid #fbbf24' : 'none',
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
 <Briefcase size={14}/>
 <span style={{ fontWeight: '600' }}>{data.label}</span>
 </div>
 {isFavorited && (<div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
 <Bookmark size={16} fill="#fbbf24" color="#fbbf24"/>
 </div>)}
 </div>);
}
function CustomEdge({ id, source, target, animated }) {
 return (<g className="custom-edge">
 <path className="edge-path" d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`} fill="none" stroke="rgba(102, 126, 234, 0.4)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
 <defs>
 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
 <polygon points="0 0, 10 3.5, 0 7" fill="rgba(102, 126, 234, 0.4)"/>
 </marker>
 </defs>
 </g>);
}
function Graph({ subjects, majors, industries, selectedItem, onSelectItem, favoritedItems }) {
 const generateNodes = () => {
 const nodes = [];
 const subjectYStart = 100;
 const subjectYSpacing = 80;
 subjects.forEach((subject, index) => {
 nodes.push({
 id: subject.id,
 type: 'customSubject',
 position: { x: 100, y: subjectYStart + index * subjectYSpacing },
 data: { label: subject.name, item: subject, category: 'middleSchoolSubjects' },
 style: { width: 100 },
 });
 });
 const majorYStart = 100;
 const majorYSpacing = 70;
 majors.forEach((major, index) => {
 nodes.push({
 id: major.id,
 type: 'customMajor',
 position: { x: 400, y: majorYStart + index * majorYSpacing },
 data: { label: major.name, item: major, category: 'universityMajors' },
 style: { width: 120 },
 });
 });
 const industryYStart = 100;
 const industryYSpacing = 75;
 industries.forEach((industry, index) => {
 nodes.push({
 id: industry.id,
 type: 'customIndustry',
 position: { x: 700, y: industryYStart + index * industryYSpacing },
 data: { label: industry.name, item: industry, category: 'industries' },
 style: { width: 120 },
 });
 });
 return nodes;
 };
 const generateEdges = () => {
 const edges = [];
 let edgeId = 0;
 majors.forEach((major) => {
 major.relatedSubjects?.forEach((subjectId) => {
 edges.push({
 id: `e${edgeId++}`,
 source: subjectId,
 target: major.id,
 type: 'custom',
 animated: true,
 });
 });
 });
 industries.forEach((industry) => {
 industry.relatedMajors?.forEach((majorId) => {
 edges.push({
 id: `e${edgeId++}`,
 source: majorId,
 target: industry.id,
 type: 'custom',
 animated: true,
 });
 });
 });
 return edges;
 };
 const nodes = useNodesState(generateNodes());
 const edges = useEdgesState(generateEdges());
 const nodeTypes = {
 customSubject: ({ data, selected }) => (<SubjectNode data={data} isFavorited={favoritedItems.includes(data.item.id)} onClick={() => onSelectItem(data.item, data.category)}/>),
 customMajor: ({ data, selected }) => (<MajorNode data={data} isFavorited={favoritedItems.includes(data.item.id)} onClick={() => onSelectItem(data.item, data.category)}/>),
 customIndustry: ({ data, selected }) => (<IndustryNode data={data} isFavorited={favoritedItems.includes(data.item.id)} onClick={() => onSelectItem(data.item, data.category)}/>),
 };
 const edgeTypes = {
 custom: CustomEdge,
 };
 const onNodeClick = useCallback((event, node) => {
 event.stopPropagation();
 const { item, category } = node.data;
 onSelectItem(item, category);
 }, [onSelectItem]);
 const { project, fitView } = useReactFlow();
 return (<div className="graph-container">
 <div className="graph-toolbar">
 <button onClick={() => fitView({ padding: 0.2 })} className="toolbar-btn">
 适应视图
 </button>
 <div className="legend">
 <span className="legend-item">
 <span className="legend-dot" style={{ backgroundColor: SUBJECT_COLOR }}/>
 <span>中学学科</span>
 </span>
 <span className="legend-item">
 <span className="legend-dot" style={{ backgroundColor: MAJOR_COLOR }}/>
 <span>大学专业</span>
 </span>
 <span className="legend-item">
 <span className="legend-dot" style={{ backgroundColor: INDUSTRY_COLOR }}/>
 <span>工作行业</span>
 </span>
 </div>
 </div>
 <div className="flow-wrapper">
 <ReactFlowProvider>
 <div className="react-flow" style={{ width: '100%', height: 'calc(100% - 50px)' }}>
 <Controls/>
 <Background/>
 {selectedItem && (<div className="selected-hint">
 <ChevronRight size={16}/>
 点击节点查看详情
 </div>)}
 </div>
 </ReactFlowProvider>
 </div>
 </div>);
}
export default Graph;
