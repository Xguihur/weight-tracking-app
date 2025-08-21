import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Share2, Settings, Info, ChevronRight, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface ProfileTabProps {
  weightData: WeightEntry[]
}

const motivationalQuotes = [
  "每一天的坚持，都在为更好的自己铺路",
  "健康是最大的财富，坚持是最好的投资",
  "小步前进，终将到达理想的彼岸",
  "今天的努力，是明天的自信",
  "相信过程，享受变化的每一刻",
  "健康生活，从记录开始",
  "每一个数字背后，都是对自己的承诺"
]

export function ProfileTab({ weightData }: ProfileTabProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [shareRange, setShareRange] = useState<'week' | 'month' | 'year'>('month')

  const generateShareData = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (shareRange) {
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
    
    const filteredData = weightData
      .filter(entry => new Date(entry.date) >= startDate)
      .map(entry => ({
        date: entry.date,
        weight: entry.weight,
        displayDate: new Date(entry.date).toLocaleDateString('zh-CN', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
    
    return filteredData
  }

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  }

  const shareData = generateShareData()
  const randomQuote = getRandomQuote()

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-medium mx-auto mb-4">
          U
        </div>
        <h1 className="text-xl font-medium mb-2">体重记录</h1>
        <p className="text-gray-600">保持健康，记录每一天</p>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {/* Share Cards */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => setShowShareDialog(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-medium">卡片分享</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        {/* Data Storage Settings */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Mock functionality - would open file system navigation
                alert('数据存储设置功能（模拟）')
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">选择数据存放路径</p>
                  <p className="text-sm text-gray-500">当前：本地存储</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => setShowAboutDialog(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-medium">关于</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="w-full max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>分享进度卡片</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Time Range Selector */}
            <div>
              <p className="text-sm font-medium mb-2">选择时间范围</p>
              <div className="flex bg-yellow-100 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <Button
                    key={range}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 py-1 rounded-md transition-colors ${
                      shareRange === range 
                        ? 'bg-yellow-500 text-white' 
                        : 'text-yellow-800 hover:bg-yellow-200'
                    }`}
                    onClick={() => setShareRange(range)}
                  >
                    {range === 'week' ? '一周' : range === 'month' ? '一月' : '一年'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">我的体重记录</h3>
                  <p className="text-sm text-gray-600">
                    {shareRange === 'week' ? '最近一周' : shareRange === 'month' ? '最近一月' : '最近一年'}的进步
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">记录天数</div>
                  <div className="text-lg font-bold text-yellow-600">{shareData.length}</div>
                </div>
              </div>
              
              {/* Chart Section */}
              <div className="h-32 mb-4 bg-white bg-opacity-50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shareData}>
                    <XAxis dataKey="displayDate" hide />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
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

              {/* Stats Section */}
              {shareData.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-white bg-opacity-60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">最新体重</div>
                    <div className="text-base font-bold text-yellow-600">
                      {shareData[shareData.length - 1]?.weight} kg
                    </div>
                  </div>
                  <div className="text-center bg-white bg-opacity-60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">最高体重</div>
                    <div className="text-base font-bold text-gray-700">
                      {Math.max(...shareData.map(d => d.weight))} kg
                    </div>
                  </div>
                  <div className="text-center bg-white bg-opacity-60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">最低体重</div>
                    <div className="text-base font-bold text-gray-700">
                      {Math.min(...shareData.map(d => d.weight))} kg
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Section */}
              <div className="text-center mb-4 py-3 bg-white bg-opacity-30 rounded-lg">
                <p className="text-sm text-gray-700 italic font-medium">"{randomQuote}"</p>
              </div>

              {/* Bottom Section with QR Code */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">扫码获取更多健康资讯</div>
                  <div className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src="./assets/images/erCode.jpg" 
                    alt="二维码" 
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-sm object-cover"
                    onError={(e) => {
                      // 如果图片加载失败，显示备用方案
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                            <div class="text-center">
                              <div class="text-xs font-bold text-yellow-800">QR</div>
                              <div class="text-xs text-yellow-600">扫码</div>
                            </div>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => {
                  // Mock download functionality
                  alert('下载卡片功能（模拟）')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button 
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
                onClick={() => {
                  // Mock share functionality
                  alert('分享功能（模拟）')
                  setShowShareDialog(false)
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
            
            {/* Tips */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                分享您的健康进步，激励更多朋友一起行动
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="w-full max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>关于应用</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-white text-xl font-medium mx-auto">
              W
            </div>
            
            <div>
              <h3 className="font-medium text-lg">体重记录</h3>
              <p className="text-gray-600">Weight Tracker</p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>版本 1.0.0</p>
              <p>简洁优雅的体重记录应用</p>
              <p>帮助您轻松追踪健康目标</p>
            </div>
            
            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <p>开发者：Figma Make AI</p>
              <p>设计理念：简约至上，专注记录</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              onClick={() => setShowAboutDialog(false)}
            >
              了解更多
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}