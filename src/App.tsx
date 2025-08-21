import React, { useState, useEffect } from 'react'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet'
import { Calendar, TrendingUp, User, Plus, BarChart3, Share2, Settings, Info } from 'lucide-react'
import { DataTab } from './components/DataTab'
import { AddWeightModal } from './components/AddWeightModal'
import { ProfileTab } from './components/ProfileTab'

// Mock data for weight tracking
const generateMockData = () => {
  const data = []
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)
  
  let currentWeight = 70 + Math.random() * 10 // Start between 70-80kg
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Add some realistic weight fluctuation
    const change = (Math.random() - 0.5) * 0.4
    currentWeight += change
    
    // Only add data for ~70% of days (realistic logging pattern)
    if (Math.random() > 0.3) {
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
      <div className="flex-1 overflow-y-auto pb-20">
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