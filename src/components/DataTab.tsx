import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
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
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Prepare line chart data
  const lineChartData = useMemo(() => {
    const now = new Date()
    
    switch (lineChartPeriod) {
      case 'week': {
        // 获取本周的周一
        const today = new Date(now)
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 周日是0，需要特殊处理
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        
        // 生成本周7天的数据
        const weekData = []
        const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          const entry = weightData.find(item => item.date === dateStr)
          
          weekData.push({
            date: dateStr,
            weight: entry?.weight || null,
            displayDate: dayNames[i]
          })
        }
        
        return weekData
      }
      
      case 'month': {
        // 获取本月的第一天和最后一天
        const year = now.getFullYear()
        const month = now.getMonth()
        const lastDay = new Date(year, month + 1, 0)
        
        // 生成本月所有天的数据
        const monthData = []
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(year, month, day)
          const dateStr = date.toISOString().split('T')[0]
          const entry = weightData.find(item => item.date === dateStr)
          
          monthData.push({
            date: dateStr,
            weight: entry?.weight || null,
            displayDate: day.toString()
          })
        }
        
        return monthData
      }
      
      case 'year': {
        // 获取当前年度12个月的平均数据（从1月到12月）
        const yearData = []
        const currentYear = now.getFullYear()
        
        for (let month = 0; month < 12; month++) {
          const monthStr = `${currentYear}-${String(month + 1).padStart(2, '0')}`
          
          // 找到这个月的所有体重数据
          const monthEntries = weightData.filter(entry => {
            return entry.date.startsWith(monthStr)
          })
          
          let averageWeight = null
          if (monthEntries.length > 0) {
            const average = monthEntries.reduce((sum, entry) => sum + entry.weight, 0) / monthEntries.length
            averageWeight = Math.round(average * 10) / 10 // 保留一位小数
          }
          
          yearData.push({
            date: monthStr,
            weight: averageWeight,
            displayDate: `${month + 1}月`
          })
        }
        
        return yearData
      }
      
      default:
        return []
    }
  }, [weightData, lineChartPeriod])

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

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const weight = data.weight
      
      if (!weight) return null
      
      // Get date info
      const date = new Date(data.date)
      const dayName = date.toLocaleDateString('zh-CN', { weekday: 'long' })
      const fullDate = date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      // Calculate change from previous day (only for non-year view)
      let changeInfo = null
      if (lineChartPeriod !== 'year') {
        const prevDate = new Date(date)
        prevDate.setDate(prevDate.getDate() - 1)
        const prevDateStr = prevDate.toISOString().split('T')[0]
        const prevEntry = weightData.find(item => item.date === prevDateStr)
        
        if (prevEntry) {
          const change = weight - prevEntry.weight
          changeInfo = {
            change: Math.round(change * 10) / 10,
            type: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same'
          }
        }
      }
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-yellow-200 max-w-xs">
          {lineChartPeriod !== 'year' ? (
            <>
              {/* 日期信息 */}
              <div className="text-xs text-gray-500 mb-1">{dayName}</div>
              <div className="text-sm font-medium mb-2">{fullDate}</div>
              
              {/* 体重 */}
              <div className="text-lg font-bold text-yellow-600 mb-2">
                {weight} kg
              </div>
              
              {/* 变化信息 */}
              {changeInfo && (
                <div className="text-xs">
                  <span className="text-gray-500">较前一天: </span>
                  <span className={`font-medium ${
                    changeInfo.type === 'increase' 
                      ? 'text-red-600' 
                      : changeInfo.type === 'decrease'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {changeInfo.type === 'increase' && '+'}
                    {changeInfo.change} kg
                    {changeInfo.type === 'increase' && ' ↗'}
                    {changeInfo.type === 'decrease' && ' ↘'}
                    {changeInfo.type === 'same' && ' →'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 年视图 */}
              <div className="text-sm font-medium mb-1">{label}</div>
              <div className="text-lg font-bold text-yellow-600 mb-1">
                {weight} kg
              </div>
              <div className="text-xs text-gray-500">月平均体重</div>
            </>
          )}
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="p-4 space-y-6">
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
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#FFD700', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#FFD700" 
                  strokeWidth={3}
                  dot={{ 
                    fill: '#FFD700', 
                    strokeWidth: 2, 
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#FFD700', 
                    strokeWidth: 2, 
                    fill: '#fff'
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}