import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Book, 
  GraduationCap, 
  Building2, 
  TrendingUp,
  Layers
} from 'lucide-react';

function TreeNode({ node, onSelectItem, selectedItem, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getIcon = () => {
    if (node.type === 'subject') return <Book size={16} />;
    if (node.type === 'major') return <GraduationCap size={16} />;
    if (node.type === 'industry') return <Building2 size={16} />;
    return <Layers size={16} />;
  };

  const getNodeColor = () => {
    if (node.type === 'subject') return '#667eea';
    if (node.type === 'major') return '#f093fb';
    if (node.type === 'industry') return '#4ade80';
    return '#718096';
  };

  const isSelected = selectedItem?.id === node.id;

  return (
    <div className="tree-node">
      <div 
        className={`tree-node-content ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          onSelectItem(node.data, node.type);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
      >
        {hasChildren && (
          <span className="tree-expand-icon">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        {!hasChildren && <span className="tree-expand-placeholder" />}
        <span className="tree-node-icon" style={{ color: getNodeColor() }}>
          {getIcon()}
        </span>
        <span className="tree-node-label">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id}
              node={child}
              onSelectItem={onSelectItem}
              selectedItem={selectedItem}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ subjects, majors, industries, selectedItem, onSelectItem }) {
  const treeData = useMemo(() => {
    const result = [];

    subjects.forEach(subject => {
      const relatedMajors = majors.filter(major => 
        major.relatedSubjects?.includes(subject.id)
      );

      const subjectNode = {
        id: subject.id,
        label: subject.name,
        type: 'subject',
        data: subject,
        children: relatedMajors.map(major => {
          const relatedIndustries = industries.filter(industry =>
            major.relatedIndustries?.includes(industry.id)
          );

          return {
            id: major.id,
            label: major.name,
            type: 'major',
            data: major,
            children: relatedIndustries.map(industry => ({
              id: industry.id,
              label: industry.name,
              type: 'industry',
              data: industry,
              children: []
            }))
          };
        })
      };

      result.push(subjectNode);
    });

    return result;
  }, [subjects, majors, industries]);

  return (
    <div className="tree-view-container">
      <div className="tree-view-header">
        <TrendingUp size={20} />
        <h3>发展路径</h3>
      </div>
      <div className="tree-view-content">
        {treeData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            onSelectItem={onSelectItem}
            selectedItem={selectedItem}
          />
        ))}
      </div>
    </div>
  );
}
