import { useState } from 'react'
import { Button } from './components/ui/button'
import { User, Plus, BarChart3 } from 'lucide-react'
import { DataTab } from './components/DataTab'
import { AddWeightModal } from './components/AddWeightModal'
import { ProfileTab } from './components/ProfileTab'

// Mock data for weight tracking
const generateMockData = () => {
  const data = []
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // 从当前年度的1月1日开始生成数据
  const startDate = new Date(currentYear, 0, 1) // 1月1日
  let currentWeight = 72 + Math.random() * 8 // Start between 72-80kg
  
  // 计算当前年度已经过去的天数
  const endDate = new Date(now)
  const daysPassed = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  for (let i = 0; i < daysPassed; i++) { // 生成从1月1日到今天的数据
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // 添加季节性体重变化趋势
    const month = date.getMonth()
    let seasonalTrend = 0
    if (month >= 10 || month <= 1) { // 冬季 (11-2月)
      seasonalTrend = 0.02 // 冬季体重稍微增加
    } else if (month >= 5 && month <= 8) { // 夏季 (6-9月)
      seasonalTrend = -0.01 // 夏季体重稍微减少
    }
    
    // 添加更真实的体重波动
    const dailyChange = (Math.random() - 0.5) * 0.6 + seasonalTrend
    currentWeight += dailyChange
    
    // 确保体重在合理范围内
    currentWeight = Math.max(65, Math.min(85, currentWeight))
    
    // 增加数据记录的真实性 - 周末记录少一些，工作日多一些
    const dayOfWeek = date.getDay()
    let recordProbability = 0.75 // 稍微提高基础记录概率
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
      recordProbability = 0.55
    }
    
    if (Math.random() < recordProbability) {
      data.push({
        date: date.toISOString().split('T')[0],
        weight: Math.round(currentWeight * 10) / 10,
        timestamp: date.getTime()
      })
    }
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp)
}

export default function App() {
  const [activeTab, setActiveTab] = useState('data')
  const [weightData, setWeightData] = useState(generateMockData())
  const [showAddModal, setShowAddModal] = useState(false)

  const addWeight = (date: string, weight: number) => {
    const newData = [...weightData.filter(item => item.date !== date)]
    newData.push({
      date,
      weight,
      timestamp: new Date(date).getTime()
    })
    setWeightData(newData.sort((a, b) => a.timestamp - b.timestamp))
  }

  const getTabContent = () => {
    switch (activeTab) {
      case 'data':
        return <DataTab weightData={weightData} />
      case 'profile':
        return <ProfileTab weightData={weightData} />
      default:
        return <DataTab weightData={weightData} />
    }
  }

  return (
    <div className="mobile-container bg-yellow-50 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 max-h-screen">
        {getTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-white border-t border-yellow-200 px-4 py-2 safe-area-pb">
        <div className="flex items-center justify-between">
          {/* Data Tab */}
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'data' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'text-gray-600 hover:bg-yellow-50'
            }`}
            onClick={() => setActiveTab('data')}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">数据</span>
          </Button>

          {/* Add Button */}
          <div className="flex-1 flex justify-center">
            <Button
              className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-lg border-4 border-white"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Profile Tab */}
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'text-gray-600 hover:bg-yellow-50'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">我的</span>
          </Button>
        </div>
      </div>

      {/* Add Weight Modal */}
      <AddWeightModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddWeight={addWeight}
        existingData={weightData}
      />
    </div>
  )
}