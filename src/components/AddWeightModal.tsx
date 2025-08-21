import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ChevronLeft, ChevronRight, Delete } from 'lucide-react'

interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface AddWeightModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWeight: (date: string, weight: number) => void
  existingData: WeightEntry[]
}

export function AddWeightModal({ isOpen, onClose, onAddWeight, existingData }: AddWeightModalProps) {
  const [step, setStep] = useState<'date' | 'weight'>('date')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [weightInput, setWeightInput] = useState<string>('')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  useEffect(() => {
    if (isOpen) {
      setStep('date')
      setSelectedDate('')
      setWeightInput('')
      setCalendarMonth(new Date())
    }
  }, [isOpen])

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    
    // Check if there's existing data for this date
    const existingEntry = existingData.find(entry => entry.date === dateStr)
    if (existingEntry) {
      setWeightInput(existingEntry.weight.toString())
    } else {
      setWeightInput('')
    }
    
    setStep('weight')
  }

  const handleKeypadPress = (value: string) => {
    if (value === 'delete') {
      setWeightInput(prev => prev.slice(0, -1))
    } else if (value === '.') {
      if (!weightInput.includes('.')) {
        setWeightInput(prev => prev + '.')
      }
    } else {
      // Limit to reasonable weight values (up to 999.9)
      const newValue = weightInput + value
      if (newValue.length <= 5) {
        setWeightInput(newValue)
      }
    }
  }

  const handleComplete = () => {
    const weight = parseFloat(weightInput)
    if (selectedDate && weight > 0 && weight < 1000) {
      onAddWeight(selectedDate, weight)
      onClose()
    }
  }

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

  // Generate calendar days
  const calendarData = React.useMemo(() => {
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
      const hasData = existingData.some(item => item.date === dateStr)
      const today = new Date().toISOString().split('T')[0]
      
      days.push({
        day,
        dateStr,
        hasData,
        isToday: dateStr === today,
        isPast: new Date(dateStr) < new Date(today)
      })
    }
    
    return days
  }, [calendarMonth, existingData])

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'delete']
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-auto rounded-t-3xl rounded-b-none p-0 bottom-0 top-auto translate-y-0 data-[state=open]:slide-in-from-bottom-full">
        {step === 'date' ? (
          /* Date Selection */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">选择日期</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">
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

            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <button
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                    ${!day ? '' : 
                      day.isToday 
                        ? 'bg-yellow-500 text-white font-medium' 
                        : day.hasData
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                  onClick={() => day && handleDateSelect(day.dateStr)}
                  disabled={!day}
                >
                  {day?.day}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>今天</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>已记录</span>
              </div>
            </div>
          </div>
        ) : (
          /* Weight Input */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('date')}
              >
                ← 返回
              </Button>
              <h2 className="text-xl font-medium">记录体重</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            {/* Selected Date Display */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">选择日期</p>
              <p className="font-medium">
                {new Date(selectedDate).toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Weight Display */}
            <div className="text-center mb-8">
              <div className="text-4xl font-light mb-2">
                {weightInput || '0'}
                <span className="text-lg text-gray-500 ml-1">kg</span>
              </div>
            </div>

            {/* Keypad */}
            <div className="space-y-3 mb-6">
              {keypadButtons.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-3 justify-center">
                  {row.map((key) => (
                    <button
                      key={key}
                      className={`
                        w-16 h-16 rounded-xl font-medium transition-all
                        ${key === 'delete' 
                          ? 'bg-gray-100 hover:bg-gray-200 flex items-center justify-center' 
                          : 'bg-yellow-100 hover:bg-yellow-200 active:scale-95'
                        }
                      `}
                      onClick={() => handleKeypadPress(key)}
                    >
                      {key === 'delete' ? (
                        <Delete className="w-5 h-5" />
                      ) : (
                        key
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Complete Button */}
            <Button 
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl"
              onClick={handleComplete}
              disabled={!weightInput || parseFloat(weightInput) <= 0}
            >
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}