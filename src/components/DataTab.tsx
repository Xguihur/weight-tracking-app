import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface DataTabProps {
  weightData: WeightEntry[]
}

export function DataTab({ weightData }: DataTabProps) {
  const [lineChartPeriod, setLineChartPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [barChartMode, setBarChartMode] = useState<'weekly' | 'monthly'>('weekly')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Prepare line chart data
  const lineChartData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    switch (lineChartPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return weightData
      .filter(entry => new Date(entry.date) >= startDate)
      .map(entry => ({
        date: entry.date,
        weight: entry.weight,
        displayDate: lineChartPeriod === 'week' 
          ? new Date(entry.date).toLocaleDateString('zh-CN', { weekday: 'short' })
          : lineChartPeriod === 'month'
          ? new Date(entry.date).toLocaleDateString('zh-CN', { day: 'numeric' })
          : new Date(entry.date).toLocaleDateString('zh-CN', { month: 'short' })
      }))
  }, [weightData, lineChartPeriod])

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    const grouped: { [key: string]: number[] } = {}
    
    weightData.forEach(entry => {
      const date = new Date(entry.date)
      const key = barChartMode === 'weekly' 
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(entry.weight)
    })
    
    return Object.entries(grouped)
      .map(([period, weights]) => ({
        period,
        average: Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10
      }))
      .slice(-8) // Show last 8 periods
  }, [weightData, barChartMode])

  // Prepare calendar data
  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entry = weightData.find(item => item.date === dateStr)
      const prevEntry = weightData.find(item => {
        const prevDate = new Date(year, month, day - 1)
        return item.date === prevDate.toISOString().split('T')[0]
      })
      
      let changeType = 'neutral'
      if (entry && prevEntry) {
        if (entry.weight < prevEntry.weight) changeType = 'decrease'
        else if (entry.weight > prevEntry.weight) changeType = 'increase'
      }
      
      days.push({
        day,
        dateStr,
        weight: entry?.weight,
        changeType,
        hasData: !!entry
      })
    }
    
    return days
  }, [calendarMonth, weightData])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Line Chart Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>体重趋势</CardTitle>
            <div className="flex bg-yellow-100 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <Button
                  key={period}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-md transition-colors ${
                    lineChartPeriod === period 
                      ? 'bg-yellow-500 text-white' 
                      : 'text-yellow-800 hover:bg-yellow-200'
                  }`}
                  onClick={() => setLineChartPeriod(period)}
                >
                  {period === 'week' ? '周' : period === 'month' ? '月' : '年'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#FFD700" 
                  strokeWidth={3}
                  dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#FFD700', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>平均对比</CardTitle>
            <div className="flex bg-yellow-100 rounded-lg p-1">
              {(['weekly', 'monthly'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-md transition-colors ${
                    barChartMode === mode 
                      ? 'bg-yellow-500 text-white' 
                      : 'text-yellow-800 hover:bg-yellow-200'
                  }`}
                  onClick={() => setBarChartMode(mode)}
                >
                  {mode === 'weekly' ? '周均' : '月均'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Bar 
                  dataKey="average" 
                  fill="#FFEB3B" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Calendar Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>月度记录</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {calendarMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-colors
                  ${!day ? '' : 
                    day.hasData 
                      ? 'bg-yellow-100 border border-yellow-200' 
                      : 'bg-gray-50 border border-gray-100'
                  }
                `}
              >
                {day && (
                  <>
                    <span className="font-medium">{day.day}</span>
                    {day.weight && (
                      <span 
                        className={`text-xs mt-1 px-1 rounded ${
                          day.changeType === 'decrease' 
                            ? 'text-green-600 bg-green-100' 
                            : day.changeType === 'increase'
                            ? 'text-red-600 bg-red-100'
                            : 'text-blue-600 bg-blue-100'
                        }`}
                      >
                        {day.weight}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>下降</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>上升</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>已记录</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}