import { useState, useEffect, useRef } from 'react'
import './App.css'

// 数据模型
const data = {
  middleSchoolSubjects: [
    { id: 'ms1', name: '数学', relatedMajors: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'], relatedIndustries: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8'] },
    { id: 'ms2', name: '物理', relatedMajors: ['u1', 'u2', 'u8', 'u9', 'u10'], relatedIndustries: ['i1', 'i2', 'i9', 'i10', 'i11'] },
    { id: 'ms3', name: '化学', relatedMajors: ['u3', 'u11', 'u12', 'u13', 'u14'], relatedIndustries: ['i3', 'i12', 'i13', 'i14', 'i15'] },
    { id: 'ms4', name: '生物', relatedMajors: ['u4', 'u12', 'u15', 'u16', 'u17'], relatedIndustries: ['i4', 'i13', 'i16', 'i17', 'i18'] },
    { id: 'ms5', name: '语文', relatedMajors: ['u18', 'u19', 'u20', 'u21', 'u22'], relatedIndustries: ['i19', 'i20', 'i21', 'i22', 'i23'] },
    { id: 'ms6', name: '英语', relatedMajors: ['u18', 'u19', 'u23', 'u24', 'u25'], relatedIndustries: ['i19', 'i20', 'i24', 'i25', 'i26'] },
    { id: 'ms7', name: '历史', relatedMajors: ['u20', 'u26', 'u27', 'u28'], relatedIndustries: ['i21', 'i27', 'i28', 'i29'] },
    { id: 'ms8', name: '地理', relatedMajors: ['u26', 'u29', 'u30', 'u14'], relatedIndustries: ['i27', 'i29', 'i30', 'i15'] },
    { id: 'ms9', name: '政治', relatedMajors: ['u20', 'u27', 'u28', 'u22'], relatedIndustries: ['i21', 'i27', 'i28', 'i23'] }
  ],
  universityMajors: [
    { id: 'u1', name: '计算机科学与技术', relatedSubjects: ['ms1', 'ms2'], relatedIndustries: ['i1', 'i2', 'i5', 'i6'] },
    { id: 'u2', name: '电子信息工程', relatedSubjects: ['ms1', 'ms2'], relatedIndustries: ['i1', 'i2', 'i7', 'i8'] },
    { id: 'u3', name: '数学与应用数学', relatedSubjects: ['ms1', 'ms3'], relatedIndustries: ['i1', 'i3', 'i9', 'i10'] },
    { id: 'u4', name: '生物医学工程', relatedSubjects: ['ms1', 'ms4'], relatedIndustries: ['i4', 'i11', 'i12'] },
    { id: 'u5', name: '统计学', relatedSubjects: ['ms1'], relatedIndustries: ['i3', 'i9', 'i13', 'i14'] },
    { id: 'u6', name: '金融工程', relatedSubjects: ['ms1'], relatedIndustries: ['i3', 'i15', 'i16', 'i17'] },
    { id: 'u7', name: '数据科学', relatedSubjects: ['ms1'], relatedIndustries: ['i1', 'i3', 'i13', 'i18'] },
    { id: 'u8', name: '物理学', relatedSubjects: ['ms2'], relatedIndustries: ['i9', 'i10', 'i19', 'i20'] },
    { id: 'u9', name: '光电信息科学', relatedSubjects: ['ms2'], relatedIndustries: ['i2', 'i7', 'i11', 'i21'] },
    { id: 'u10', name: '核工程与核技术', relatedSubjects: ['ms2'], relatedIndustries: ['i11', 'i22', 'i23', 'i24'] },
    { id: 'u11', name: '化学工程与工艺', relatedSubjects: ['ms3'], relatedIndustries: ['i12', 'i14', 'i22', 'i25'] },
    { id: 'u12', name: '生物工程', relatedSubjects: ['ms3', 'ms4'], relatedIndustries: ['i13', 'i16', 'i26', 'i27'] },
    { id: 'u13', name: '材料科学与工程', relatedSubjects: ['ms3'], relatedIndustries: ['i7', 'i12', 'i28', 'i29'] },
    { id: 'u14', name: '环境科学', relatedSubjects: ['ms3', 'ms8'], relatedIndustries: ['i14', 'i15', 'i30'] },
    { id: 'u15', name: '临床医学', relatedSubjects: ['ms4'], relatedIndustries: ['i4', 'i17', 'i18', 'i26'] },
    { id: 'u16', name: '药学', relatedSubjects: ['ms4'], relatedIndustries: ['i13', 'i16', 'i17', 'i27'] },
    { id: 'u17', name: '护理学', relatedSubjects: ['ms4'], relatedIndustries: ['i4', 'i18', 'i26'] },
    { id: 'u18', name: '中国语言文学', relatedSubjects: ['ms5', 'ms6'], relatedIndustries: ['i19', 'i20', 'i24', 'i28'] },
    { id: 'u19', name: '外国语言文学', relatedSubjects: ['ms5', 'ms6'], relatedIndustries: ['i19', 'i20', 'i24', 'i25'] },
    { id: 'u20', name: '法学', relatedSubjects: ['ms5', 'ms7', 'ms9'], relatedIndustries: ['i21', 'i23', 'i27'] },
    { id: 'u21', name: '新闻传播学', relatedSubjects: ['ms5'], relatedIndustries: ['i19', 'i24', 'i28', 'i29'] },
    { id: 'u22', name: '广告学', relatedSubjects: ['ms5', 'ms9'], relatedIndustries: ['i19', 'i23', 'i29'] },
    { id: 'u23', name: '国际经济与贸易', relatedSubjects: ['ms6'], relatedIndustries: ['i15', 'i24', 'i25', 'i30'] },
    { id: 'u24', name: '商务英语', relatedSubjects: ['ms6'], relatedIndustries: ['i24', 'i25', 'i26'] },
    { id: 'u25', name: '翻译', relatedSubjects: ['ms6'], relatedIndustries: ['i19', 'i24', 'i25'] },
    { id: 'u26', name: '历史学', relatedSubjects: ['ms7', 'ms8'], relatedIndustries: ['i27', 'i28', 'i29'] },
    { id: 'u27', name: '政治学与行政学', relatedSubjects: ['ms7', 'ms9'], relatedIndustries: ['i21', 'i23', 'i27'] },
    { id: 'u28', name: '公共事业管理', relatedSubjects: ['ms7', 'ms9'], relatedIndustries: ['i21', 'i23', 'i27'] },
    { id: 'u29', name: '地理科学', relatedSubjects: ['ms8'], relatedIndustries: ['i27', 'i29', 'i30'] },
    { id: 'u30', name: '城乡规划', relatedSubjects: ['ms8'], relatedIndustries: ['i27', 'i29', 'i30'] }
  ],
  industries: [
    { id: 'i1', name: '互联网科技', relatedSubjects: ['ms1', 'ms2'], relatedMajors: ['u1', 'u2', 'u3', 'u7'] },
    { id: 'i2', name: '电子通信', relatedSubjects: ['ms1', 'ms2'], relatedMajors: ['u1', 'u2'] },
    { id: 'i3', name: '金融科技', relatedSubjects: ['ms1', 'ms3'], relatedMajors: ['u3', 'u5', 'u6', 'u7'] },
    { id: 'i4', name: '医疗健康', relatedSubjects: ['ms1', 'ms4'], relatedMajors: ['u4', 'u15', 'u17'] },
    { id: 'i5', name: '人工智能', relatedSubjects: ['ms1'], relatedMajors: ['u1', 'u7'] },
    { id: 'i6', name: '软件开发', relatedSubjects: ['ms1'], relatedMajors: ['u1'] },
    { id: 'i7', name: '半导体芯片', relatedSubjects: ['ms2', 'ms3'], relatedMajors: ['u2', 'u9', 'u13'] },
    { id: 'i8', name: '物联网', relatedSubjects: ['ms1', 'ms2'], relatedMajors: ['u2'] },
    { id: 'i9', name: '科学研究', relatedSubjects: ['ms1', 'ms2'], relatedMajors: ['u3', 'u5', 'u8'] },
    { id: 'i10', name: '高等教育', relatedSubjects: ['ms1', 'ms2'], relatedMajors: ['u3', 'u5', 'u8'] },
    { id: 'i11', name: '医疗器械', relatedSubjects: ['ms1', 'ms2', 'ms4'], relatedMajors: ['u4', 'u9', 'u10'] },
    { id: 'i12', name: '生物制药', relatedSubjects: ['ms3', 'ms4'], relatedMajors: ['u4', 'u11', 'u13'] },
    { id: 'i13', name: '化工新材料', relatedSubjects: ['ms3', 'ms4'], relatedMajors: ['u11', 'u12', 'u16'] },
    { id: 'i14', name: '新能源', relatedSubjects: ['ms1', 'ms3'], relatedMajors: ['u5', 'u11', 'u14'] },
    { id: 'i15', name: '环保工程', relatedSubjects: ['ms1', 'ms3', 'ms8'], relatedMajors: ['u6', 'u14', 'u23'] },
    { id: 'i16', name: '农业科技', relatedSubjects: ['ms3', 'ms4'], relatedMajors: ['u6', 'u12', 'u16'] },
    { id: 'i17', name: '临床医疗', relatedSubjects: ['ms1', 'ms4'], relatedMajors: ['u6', 'u15', 'u16'] },
    { id: 'i18', name: '公共卫生', relatedSubjects: ['ms1', 'ms4'], relatedMajors: ['u7', 'u15', 'u17'] },
    { id: 'i19', name: '文化传媒', relatedSubjects: ['ms5', 'ms6'], relatedMajors: ['u18', 'u19', 'u21', 'u22', 'u25'] },
    { id: 'i20', name: '教育培训', relatedSubjects: ['ms5', 'ms6'], relatedMajors: ['u18', 'u19'] },
    { id: 'i21', name: '法律服务', relatedSubjects: ['ms5', 'ms7', 'ms9'], relatedMajors: ['u20', 'u27', 'u28'] },
    { id: 'i22', name: '新闻出版', relatedSubjects: ['ms5', 'ms7'], relatedMajors: ['u20', 'u21'] },
    { id: 'i23', name: '政府公共管理', relatedSubjects: ['ms5', 'ms7', 'ms9'], relatedMajors: ['u20', 'u22', 'u27', 'u28'] },
    { id: 'i24', name: '国际贸易', relatedSubjects: ['ms6'], relatedMajors: ['u19', 'u23', 'u24', 'u25'] },
    { id: 'i25', name: '跨境电商', relatedSubjects: ['ms6'], relatedMajors: ['u19', 'u23', 'u24'] },
    { id: 'i26', name: '旅游酒店', relatedSubjects: ['ms4', 'ms6'], relatedMajors: ['u12', 'u15', 'u17', 'u24'] },
    { id: 'i27', name: '文博考古', relatedSubjects: ['ms3', 'ms4', 'ms7', 'ms8', 'ms9'], relatedMajors: ['u12', 'u20', 'u26', 'u27', 'u28', 'u29', 'u30'] },
    { id: 'i28', name: '广告营销', relatedSubjects: ['ms5', 'ms7'], relatedMajors: ['u18', 'u21', 'u22', 'u26'] },
    { id: 'i29', name: '城市规划', relatedSubjects: ['ms7', 'ms8'], relatedMajors: ['u21', 'u22', 'u26', 'u29', 'u30'] },
    { id: 'i30', name: '国土资源', relatedSubjects: ['ms3', 'ms8'], relatedMajors: ['u14', 'u23', 'u29', 'u30'] }
  ]
}

function App() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [highlightedItems, setHighlightedItems] = useState({})
  const [scrollKey, setScrollKey] = useState(0)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const canvasRef = useRef(null)

  // 处理项目点击
  const handleItemClick = (item, category) => {
    setSelectedItem({ ...item, category })
    
    // 设置选中项目的详细信息
    let details = {
      name: item.name,
      category: category,
      relatedItems: []
    }
    
    if (category === 'middleSchoolSubjects') {
      // 中学学科的详细信息
      const subject = data.middleSchoolSubjects.find(s => s.id === item.id)
      if (subject) {
        details.relatedItems = [
          ...subject.relatedMajors.map(majorId => {
            const major = data.universityMajors.find(m => m.id === majorId)
            return { type: '专业', name: major ? major.name : majorId }
          }),
          ...subject.relatedIndustries.map(industryId => {
            const industry = data.industries.find(i => i.id === industryId)
            return { type: '行业', name: industry ? industry.name : industryId }
          })
        ]
      }
    } else if (category === 'universityMajors') {
      // 大学专业的详细信息
      const major = data.universityMajors.find(m => m.id === item.id)
      if (major) {
        details.relatedItems = [
          ...major.relatedSubjects.map(subjectId => {
            const subject = data.middleSchoolSubjects.find(s => s.id === subjectId)
            return { type: '学科', name: subject ? subject.name : subjectId }
          }),
          ...major.relatedIndustries.map(industryId => {
            const industry = data.industries.find(i => i.id === industryId)
            return { type: '行业', name: industry ? industry.name : industryId }
          })
        ]
      }
    } else if (category === 'industries') {
      // 工作行业的详细信息
      const industry = data.industries.find(i => i.id === item.id)
      if (industry) {
        details.relatedItems = [
          ...industry.relatedSubjects.map(subjectId => {
            const subject = data.middleSchoolSubjects.find(s => s.id === subjectId)
            return { type: '学科', name: subject ? subject.name : subjectId }
          }),
          ...industry.relatedMajors.map(majorId => {
            const major = data.universityMajors.find(m => m.id === majorId)
            return { type: '专业', name: major ? major.name : majorId }
          })
        ]
      }
    }
    
    setSelectedDetails(details)
  }

  // 处理滚动事件
  const handleScroll = () => {
    setScrollKey(prev => prev + 1)
  }

  // 更新高亮项目和连接线
  useEffect(() => {
    if (!selectedItem) {
      setHighlightedItems({})
      return
    }

    const { id, category } = selectedItem
    const newHighlighted = { [id]: true }

    // 根据选择的类别更新相关项目
    if (category === 'middleSchoolSubjects') {
      const subject = data.middleSchoolSubjects.find(s => s.id === id)
      if (subject) {
        subject.relatedMajors.forEach(majorId => {
          newHighlighted[majorId] = true
        })
        subject.relatedIndustries.forEach(industryId => {
          newHighlighted[industryId] = true
        })
      }
    } else if (category === 'universityMajors') {
      const major = data.universityMajors.find(m => m.id === id)
      if (major) {
        major.relatedSubjects.forEach(subjectId => {
          newHighlighted[subjectId] = true
        })
        major.relatedIndustries.forEach(industryId => {
          newHighlighted[industryId] = true
        })
      }
    } else if (category === 'industries') {
      const industry = data.industries.find(i => i.id === id)
      if (industry) {
        industry.relatedSubjects.forEach(subjectId => {
          newHighlighted[subjectId] = true
        })
        industry.relatedMajors.forEach(majorId => {
          newHighlighted[majorId] = true
        })
      }
    }

    setHighlightedItems(newHighlighted)
  }, [selectedItem])

  // 绘制连接线
  useEffect(() => {
    if (!canvasRef.current || !selectedItem) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 获取所有高亮项目的位置
    const itemPositions = {}
    document.querySelectorAll('.item').forEach(item => {
      const id = item.dataset.id
      if (highlightedItems[id]) {
        const itemRect = item.getBoundingClientRect()
        const canvasRect = canvas.getBoundingClientRect()
        itemPositions[id] = {
          x: (itemRect.left + itemRect.right) / 2 - canvasRect.left,
          y: (itemRect.top + itemRect.bottom) / 2 - canvasRect.top
        }
      }
    })

    // 连接所有高亮项目
    const ids = Object.keys(itemPositions)
    
    // 按列分组元素，只连接不同列之间的元素
    const itemsByColumn = {}
    document.querySelectorAll('.item').forEach(item => {
      const id = item.dataset.id
      if (highlightedItems[id]) {
        const column = item.closest('.column')
        if (column) {
          const columnIndex = Array.from(column.parentElement.children).indexOf(column)
          if (!itemsByColumn[columnIndex]) {
            itemsByColumn[columnIndex] = []
          }
          itemsByColumn[columnIndex].push(id)
        }
      }
    })

    // 只连接学科和专业，以及专业和工作行业
    // 列索引：0=学科, 1=专业, 2=工作行业
    const subjects = itemsByColumn[0] || []
    const majors = itemsByColumn[1] || []
    const industries = itemsByColumn[2] || []
    
    // 连接学科和专业 - 使用蓝色
    ctx.strokeStyle = '#667eea'
    ctx.lineWidth = 2
    subjects.forEach(subjectId => {
      majors.forEach(majorId => {
        const pos1 = itemPositions[subjectId]
        const pos2 = itemPositions[majorId]
        
        // 获取两个元素的边界
        const item1 = document.querySelector(`.item[data-id="${subjectId}"]`)
        const item2 = document.querySelector(`.item[data-id="${majorId}"]`)
        
        if (item1 && item2) {
          const rect1 = item1.getBoundingClientRect()
          const rect2 = item2.getBoundingClientRect()
          const canvasRect = canvas.getBoundingClientRect()
          
          // 计算元素在canvas中的位置
          const rect1Canvas = {
            left: rect1.left - canvasRect.left,
            top: rect1.top - canvasRect.top,
            right: rect1.right - canvasRect.left,
            bottom: rect1.bottom - canvasRect.top,
            width: rect1.width,
            height: rect1.height
          }
          
          const rect2Canvas = {
            left: rect2.left - canvasRect.left,
            top: rect2.top - canvasRect.top,
            right: rect2.right - canvasRect.left,
            bottom: rect2.bottom - canvasRect.top,
            width: rect2.width,
            height: rect2.height
          }
          
          // 学科在左侧，从右侧边缘出发
          const x1 = rect1Canvas.right
          const y1 = rect1Canvas.top + rect1Canvas.height / 2
          
          // 专业在中间，从左侧边缘出发
          const x2 = rect2Canvas.left
          const y2 = rect2Canvas.top + rect2Canvas.height / 2
          
          // 绘制连接线
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      })
    })
    
    // 连接专业和工作行业 - 为每个专业使用不同颜色
    ctx.lineWidth = 2
    
    // 为不同专业定义不同颜色
    const majorColors = {
      'u1': '#f093fb',  // 粉色
      'u2': '#f5576c',  // 红色
      'u3': '#4facfe',  // 蓝色
      'u4': '#00f2fe',  // 青色
      'u5': '#43e97b',  // 绿色
      'u6': '#38f9d7',  // 薄荷绿
      'u7': '#fa709a',  // 玫红
      'u8': '#fee140',  // 黄色
      'u9': '#a8edea',  // 浅青
      'u10': '#fed6e3', // 浅粉
      'u11': '#d299c2', // 紫色
      'u12': '#fef9d7', // 浅黄
      'u13': '#a1c4fd', // 浅蓝
      'u14': '#c2e9fb', // 天蓝
      'u15': '#fbc2eb', // 粉紫
      'u16': '#a6c1ee', // 淡蓝
      'u17': '#c2e9fb', // 天蓝
      'u18': '#d4fc79', // 黄绿
      'u19': '#96e6a1', // 草绿
      'u20': '#84fab0', // 薄荷
      'u21': '#8fd3f4', // 湖蓝
      'u22': '#a8edea', // 浅青
      'u23': '#fed6e3', // 浅粉
      'u24': '#d299c2', // 紫色
      'u25': '#fef9d7', // 浅黄
      'u26': '#a1c4fd', // 浅蓝
      'u27': '#c2e9fb', // 天蓝
      'u28': '#fbc2eb', // 粉紫
      'u29': '#a6c1ee', // 淡蓝
      'u30': '#d4fc79'  // 黄绿
    }
    
    majors.forEach(majorId => {
      // 为每个专业选择对应的颜色，如果没有定义则使用默认颜色
      const color = majorColors[majorId] || '#f093fb'
      ctx.strokeStyle = color
      
      industries.forEach(industryId => {
        const pos1 = itemPositions[majorId]
        const pos2 = itemPositions[industryId]
        
        // 获取两个元素的边界
        const item1 = document.querySelector(`.item[data-id="${majorId}"]`)
        const item2 = document.querySelector(`.item[data-id="${industryId}"]`)
        
        if (item1 && item2) {
          const rect1 = item1.getBoundingClientRect()
          const rect2 = item2.getBoundingClientRect()
          const canvasRect = canvas.getBoundingClientRect()
          
          // 计算元素在canvas中的位置
          const rect1Canvas = {
            left: rect1.left - canvasRect.left,
            top: rect1.top - canvasRect.top,
            right: rect1.right - canvasRect.left,
            bottom: rect1.bottom - canvasRect.top,
            width: rect1.width,
            height: rect1.height
          }
          
          const rect2Canvas = {
            left: rect2.left - canvasRect.left,
            top: rect2.top - canvasRect.top,
            right: rect2.right - canvasRect.left,
            bottom: rect2.bottom - canvasRect.top,
            width: rect2.width,
            height: rect2.height
          }
          
          // 专业在中间，从右侧边缘出发
          const x1 = rect1Canvas.right
          const y1 = rect1Canvas.top + rect1Canvas.height / 2
          
          // 工作行业在右侧，从左侧边缘出发
          const x2 = rect2Canvas.left
          const y2 = rect2Canvas.top + rect2Canvas.height / 2
          
          // 绘制连接线
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      })
    })
  }, [selectedItem, highlightedItems, scrollKey])

  return (
    <div className="app">
      <h1>学科-专业-行业关系图</h1>
      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          className="connection-canvas"
          width={window.innerWidth}
          height={window.innerHeight - 100}
        />
        <div className="columns-container">
          {/* 中学学科列 */}
          <div className="column" onScroll={handleScroll}>
            <h2>中学学科</h2>
            <div className="items-list">
              {data.middleSchoolSubjects.map(subject => (
                <div
                  key={subject.id}
                  className={`item ${highlightedItems[subject.id] ? 'highlighted' : ''} ${selectedItem && selectedItem.id === subject.id ? 'selected' : ''}`}
                  data-id={subject.id}
                  onClick={() => handleItemClick(subject, 'middleSchoolSubjects')}
                >
                  {subject.name}
                </div>
              ))}
            </div>
          </div>

          {/* 大学专业列 */}
          <div className="column" onScroll={handleScroll}>
            <h2>大学专业</h2>
            <div className="items-list">
              {data.universityMajors.map(major => (
                <div
                  key={major.id}
                  className={`item ${highlightedItems[major.id] ? 'highlighted' : ''} ${selectedItem && selectedItem.id === major.id ? 'selected' : ''}`}
                  data-id={major.id}
                  onClick={() => handleItemClick(major, 'universityMajors')}
                >
                  {major.name}
                </div>
              ))}
            </div>
          </div>

          {/* 工作行业列 */}
          <div className="column" onScroll={handleScroll}>
            <h2>工作行业</h2>
            <div className="items-list">
              {data.industries.map(industry => (
                <div
                  key={industry.id}
                  className={`item ${highlightedItems[industry.id] ? 'highlighted' : ''} ${selectedItem && selectedItem.id === industry.id ? 'selected' : ''}`}
                  data-id={industry.id}
                  onClick={() => handleItemClick(industry, 'industries')}
                >
                  {industry.name}
                </div>
              ))}
            </div>
          </div>

          {/* 详细信息列 */}
          <div className="column">
            <h2>详细信息</h2>
            <div className="details-container">
              {selectedDetails ? (
                <div className="details-content">
                  <h3>{selectedDetails.name}</h3>
                  <p className="category">
                    {selectedDetails.category === 'middleSchoolSubjects' ? '中学学科' : 
                     selectedDetails.category === 'universityMajors' ? '大学专业' : '工作行业'}
                  </p>
                  <h4>相关项目</h4>
                  <ul className="related-items">
                    {selectedDetails.relatedItems.map((item, index) => (
                      <li key={index}>
                        <span className="item-type">{item.type}:</span>
                        <span className="item-name">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="no-selection">
                  <p>请选择一个项目查看详细信息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
