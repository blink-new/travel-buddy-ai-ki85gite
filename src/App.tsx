import { useState, useEffect } from 'react'
import { Plane, MapPin, MessageCircle, Calculator, AlertTriangle, Search, Compass, Shield, Sparkles } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { ScrollArea } from './components/ui/scroll-area'
import { Separator } from './components/ui/separator'
import { Alert, AlertDescription } from './components/ui/alert'
import blink from './blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface TripPlan {
  title: string
  days: Array<{
    day: number
    activities: string[]
    meals: string[]
    accommodation?: string
  }>
  packingList: string[]
  budget: {
    estimated: number
    breakdown: Record<string, number>
  }
}

interface LocalPlace {
  id: string
  name: string
  type: string
  description: string
  rating: number
  image: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Trip Planner State
  const [tripPlannerOpen, setTripPlannerOpen] = useState(false)
  const [tripForm, setTripForm] = useState({
    destination: '',
    duration: '',
    budget: '',
    style: '',
    interests: ''
  })
  const [generatedTrip, setGeneratedTrip] = useState<TripPlan | null>(null)
  const [tripLoading, setTripLoading] = useState(false)
  
  // Explorer State
  const [explorerQuery, setExplorerQuery] = useState('')
  const [explorerResult, setExplorerResult] = useState('')
  const [explorerLoading, setExplorerLoading] = useState(false)
  
  // Chat Assistant State
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  
  // Helper Tools State
  const [currencyFrom, setCurrencyFrom] = useState('USD')
  const [currencyTo, setCurrencyTo] = useState('EUR')
  const [currencyAmount, setCurrencyAmount] = useState('')
  const [currencyResult, setCurrencyResult] = useState('')
  const [lostItemQuery, setLostItemQuery] = useState('')
  const [lostItemAdvice, setLostItemAdvice] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [flightStatus, setFlightStatus] = useState('')
  
  // Emergency SOS State
  const [sosOpen, setSosOpen] = useState(false)
  const [sosAdvice, setSosAdvice] = useState('')
  
  // Local Discovery State
  const [localPlaces] = useState<LocalPlace[]>([
    {
      id: '1',
      name: 'Central Park',
      type: 'Park',
      description: 'Iconic 843-acre urban oasis featuring lakes, meadows, and walking trails in the heart of Manhattan',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'Brooklyn Bridge',
      type: 'Landmark',
      description: 'Historic 1883 suspension bridge offering stunning skyline views and pedestrian walkway',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      name: 'Times Square',
      type: 'Entertainment',
      description: 'Vibrant commercial hub known as "The Crossroads of the World" with Broadway theaters',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      name: 'High Line Park',
      type: 'Park',
      description: 'Elevated linear park built on former railway tracks with gardens and art installations',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      name: 'Metropolitan Museum',
      type: 'Museum',
      description: 'World-renowned art museum housing over 2 million works spanning 5,000 years of history',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      name: 'Little Italy',
      type: 'Neighborhood',
      description: 'Historic Italian-American enclave famous for authentic restaurants and cultural festivals',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      name: 'One World Observatory',
      type: 'Observation Deck',
      description: 'Spectacular 360-degree views from the 100th-104th floors of One World Trade Center',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      name: 'Chelsea Market',
      type: 'Food Hall',
      description: 'Indoor food hall and shopping mall in a former Nabisco factory with artisanal vendors',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop'
    },
    {
      id: '9',
      name: 'Statue of Liberty',
      type: 'Monument',
      description: 'Iconic symbol of freedom and democracy on Liberty Island, accessible by ferry',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=400&h=300&fit=crop'
    },
    {
      id: '10',
      name: 'Chinatown',
      type: 'Neighborhood',
      description: 'Vibrant cultural district with authentic dim sum, herbal shops, and traditional markets',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '11',
      name: 'The Vessel',
      type: 'Art Installation',
      description: 'Honeycomb-like structure with 154 interconnecting flights of stairs at Hudson Yards',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=400&h=300&fit=crop'
    },
    {
      id: '12',
      name: 'Bryant Park',
      type: 'Park',
      description: 'Midtown green space hosting seasonal events, outdoor movies, and winter ice skating',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    }
  ])
  const [selectedPlace, setSelectedPlace] = useState<LocalPlace | null>(null)
  const [placeTips, setPlaceTips] = useState('')
  const [tipsLoading, setTipsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const generateTrip = async () => {
    if (!tripForm.destination || !tripForm.duration) return
    
    setTripLoading(true)
    try {
      const { object } = await blink.ai.generateObject({
        prompt: `Create a detailed travel itinerary for a ${tripForm.duration}-day trip to ${tripForm.destination}. 
        Budget: ${tripForm.budget || 'moderate'}, Style: ${tripForm.style || 'balanced'}, 
        Interests: ${tripForm.interests || 'general sightseeing'}. 
        Include daily activities, meals, and a comprehensive packing list.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  activities: { type: 'array', items: { type: 'string' } },
                  meals: { type: 'array', items: { type: 'string' } },
                  accommodation: { type: 'string' }
                }
              }
            },
            packingList: { type: 'array', items: { type: 'string' } },
            budget: {
              type: 'object',
              properties: {
                estimated: { type: 'number' },
                breakdown: { type: 'object' }
              }
            }
          }
        }
      })
      setGeneratedTrip(object as TripPlan)
    } catch (error) {
      console.error('Error generating trip:', error)
    } finally {
      setTripLoading(false)
    }
  }

  const handleExplorerSearch = async () => {
    if (!explorerQuery.trim()) return
    
    setExplorerLoading(true)
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As a travel expert, provide detailed and creative travel ideas for: "${explorerQuery}". 
        Include specific recommendations, hidden gems, and practical tips. Make it engaging and informative.`,
        maxTokens: 500
      })
      setExplorerResult(text)
    } catch (error) {
      console.error('Error in explorer search:', error)
    } finally {
      setExplorerLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)
    
    try {
      let assistantResponse = ''
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
      
      await blink.ai.streamText(
        {
          prompt: `You are a helpful travel assistant. Answer this travel-related question: "${chatInput}". 
          Provide practical, accurate, and friendly advice.`,
          maxTokens: 300
        },
        (chunk) => {
          assistantResponse += chunk
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantResponse }
                : msg
            )
          )
        }
      )
    } catch (error) {
      console.error('Error in chat:', error)
    } finally {
      setChatLoading(false)
    }
  }

  const convertCurrency = async () => {
    if (!currencyAmount || !currencyFrom || !currencyTo) return
    
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Convert ${currencyAmount} ${currencyFrom} to ${currencyTo}. 
        Provide the current exchange rate and converted amount. Be accurate and include the rate source.`,
        search: true,
        maxTokens: 150
      })
      setCurrencyResult(text)
    } catch (error) {
      console.error('Error converting currency:', error)
    }
  }

  const getLostItemAdvice = async () => {
    if (!lostItemQuery.trim()) return
    
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Provide practical advice for this travel emergency: "Lost ${lostItemQuery}". 
        Include immediate steps, who to contact, and how to prevent this in the future.`,
        maxTokens: 300
      })
      setLostItemAdvice(text)
    } catch (error) {
      console.error('Error getting lost item advice:', error)
    }
  }

  const checkFlightStatus = async () => {
    if (!flightNumber.trim()) return
    
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Check the current status of flight ${flightNumber}. 
        Provide departure/arrival times, delays, gate information, and any relevant updates.`,
        search: true,
        maxTokens: 200
      })
      setFlightStatus(text)
    } catch (error) {
      console.error('Error checking flight status:', error)
    }
  }

  const getPlaceTips = async (place: LocalPlace) => {
    setSelectedPlace(place)
    setTipsLoading(true)
    
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Provide unique AI tips and useful local phrases for visiting ${place.name} in ${place.type}. 
        Include insider tips, best times to visit, local etiquette, and 3-5 useful phrases with pronunciation.`,
        maxTokens: 300
      })
      setPlaceTips(text)
    } catch (error) {
      console.error('Error getting place tips:', error)
    } finally {
      setTipsLoading(false)
    }
  }

  const getEmergencyAdvice = async () => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Provide general emergency safety advice for travelers. 
        Include what to do in common emergency situations, important contacts, and safety tips.`,
        maxTokens: 400
      })
      setSosAdvice(text)
    } catch (error) {
      console.error('Error getting emergency advice:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Travel Buddy AI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Plane className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-gradient">Travel Buddy AI</CardTitle>
            <CardDescription>Your AI-powered travel companion</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Sign In to Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Travel Buddy AI</h1>
              <p className="text-sm text-muted-foreground">Your AI Travel Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:flex">
              Welcome, {user.displayName || user.email}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => blink.auth.logout()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-0">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.1),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              {/* Main Hero Content */}
              <div className="space-y-6">
                <Badge className="mx-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  ✨ Powered by Advanced AI Technology
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                  Your AI Travel
                  <br />
                  <span className="text-accent">Companion</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover, plan, and navigate your journeys with the power of artificial intelligence. 
                  From detailed itineraries to real-time assistance, we've got your travels covered.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg h-auto"
                  onClick={() => setTripPlannerOpen(true)}
                >
                  <MapPin className="w-6 h-6 mr-3" />
                  Start Planning Your Trip
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg h-auto border-primary/20 hover:bg-primary/5"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Chat with AI Assistant
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-12">
                <div className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Trips Planned</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Support</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">99%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Generative Explorer Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <Badge className="mx-auto bg-accent/10 text-accent border-accent/20">
                  <Search className="w-4 h-4 mr-2" />
                  AI-Powered Discovery
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gradient">
                  Explore with Intelligence
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Ask for creative travel ideas and get detailed, personalized recommendations 
                  tailored to your preferences and style.
                </p>
              </div>
              
              <Card className="max-w-3xl mx-auto glass-card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <Input
                        placeholder="e.g., plan a 3-day relaxing getaway in the mountains with light hiking"
                        value={explorerQuery}
                        onChange={(e) => setExplorerQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleExplorerSearch()}
                        className="flex-1 h-12 text-lg"
                      />
                      <Button 
                        onClick={handleExplorerSearch}
                        disabled={explorerLoading}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 h-12"
                      >
                        {explorerLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                            Exploring...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5 mr-2" />
                            Explore
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {explorerResult && (
                      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{explorerResult}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Core Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gradient">
                Everything You Need for Perfect Travel
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive AI-powered tools to make your travel planning effortless and enjoyable
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* AI Trip Planner */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                AI Trip Planner
              </CardTitle>
              <CardDescription>
                Generate detailed itineraries with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={tripPlannerOpen} onOpenChange={setTripPlannerOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Plan Your Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Trip Planner</DialogTitle>
                    <DialogDescription>
                      Tell us about your dream trip and we'll create a personalized itinerary
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="destination">Destination</Label>
                        <Input
                          id="destination"
                          placeholder="e.g., Tokyo, Japan"
                          value={tripForm.destination}
                          onChange={(e) => setTripForm(prev => ({ ...prev, destination: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 7"
                          value={tripForm.duration}
                          onChange={(e) => setTripForm(prev => ({ ...prev, duration: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Budget Range</Label>
                        <Select value={tripForm.budget} onValueChange={(value) => setTripForm(prev => ({ ...prev, budget: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget ($)</SelectItem>
                            <SelectItem value="moderate">Moderate ($$)</SelectItem>
                            <SelectItem value="luxury">Luxury ($$$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="style">Travel Style</Label>
                        <Select value={tripForm.style} onValueChange={(value) => setTripForm(prev => ({ ...prev, style: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adventure">Adventure</SelectItem>
                            <SelectItem value="relaxation">Relaxation</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="interests">Interests & Preferences</Label>
                      <Textarea
                        id="interests"
                        placeholder="e.g., food tours, museums, nightlife, nature..."
                        value={tripForm.interests}
                        onChange={(e) => setTripForm(prev => ({ ...prev, interests: e.target.value }))}
                      />
                    </div>
                    
                    <Button 
                      onClick={generateTrip}
                      disabled={tripLoading || !tripForm.destination || !tripForm.duration}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {tripLoading ? 'Generating Trip...' : 'Generate Itinerary'}
                    </Button>
                    
                    {generatedTrip && (
                      <ScrollArea className="h-96 w-full border rounded-lg p-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary">{generatedTrip.title}</h3>
                          
                          <div className="space-y-3">
                            {generatedTrip.days.map((day) => (
                              <Card key={day.day} className="bg-muted/50">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Day {day.day}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Activities:</p>
                                    <ul className="text-xs space-y-1">
                                      {day.activities.map((activity, i) => (
                                        <li key={i}>• {activity}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {day.meals.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Meals:</p>
                                      <ul className="text-xs space-y-1">
                                        {day.meals.map((meal, i) => (
                                          <li key={i}>• {meal}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          {generatedTrip.packingList.length > 0 && (
                            <Card className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Packing List</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="text-xs space-y-1">
                                  {generatedTrip.packingList.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* AI Assistant Chat */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Chat with your travel assistant for instant help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Start Conversation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Travel Assistant</DialogTitle>
                    <DialogDescription>
                      Ask me anything about travel, local customs, or trip planning
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="flex-1 h-96 border rounded-lg p-4">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Ask me about travel tips, local customs, or anything else..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendChatMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Send
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
            </div>
          </div>
        </section>

        {/* Helper Tools */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge className="mx-auto bg-accent/10 text-accent border-accent/20">
                <Calculator className="w-4 h-4 mr-2" />
                Smart Tools
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-gradient">Travel Helper Tools</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Quick AI-powered utilities to solve common travel challenges instantly
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Currency Converter */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="w-5 h-5" />
                  Currency Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={currencyFrom} onValueChange={setCurrencyFrom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={currencyTo} onValueChange={setCurrencyTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Amount"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(e.target.value)}
                />
                <Button onClick={convertCurrency} className="w-full" size="sm">
                  Convert
                </Button>
                {currencyResult && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-3">
                      <p className="text-xs">{currencyResult}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Lost Item Advisor */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Lost Item Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="What did you lose? (e.g., passport, wallet)"
                  value={lostItemQuery}
                  onChange={(e) => setLostItemQuery(e.target.value)}
                />
                <Button onClick={getLostItemAdvice} className="w-full" size="sm">
                  Get Advice
                </Button>
                {lostItemAdvice && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-3">
                      <p className="text-xs whitespace-pre-wrap">{lostItemAdvice}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Flight Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plane className="w-5 h-5" />
                  Flight Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Flight number (e.g., AA123)"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
                <Button onClick={checkFlightStatus} className="w-full" size="sm">
                  Check Status
                </Button>
                {flightStatus && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-3">
                      <p className="text-xs whitespace-pre-wrap">{flightStatus}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                Testimonials
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-gradient">What Travelers Say</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied travelers who trust Travel Buddy AI for their adventures
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex text-accent">
                    {"⭐".repeat(5)}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "Travel Buddy AI planned my entire Japan trip perfectly. The AI recommendations were spot-on and saved me hours of research!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">SM</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sarah M.</p>
                      <p className="text-xs text-muted-foreground">Digital Nomad</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex text-accent">
                    {"⭐".repeat(5)}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "The emergency SOS feature gave me peace of mind during my solo backpacking trip. Highly recommend!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">MJ</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mike J.</p>
                      <p className="text-xs text-muted-foreground">Adventure Traveler</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex text-accent">
                    {"⭐".repeat(5)}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "The AI assistant answered all my travel questions instantly. It's like having a personal travel expert!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">EL</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Emma L.</p>
                      <p className="text-xs text-muted-foreground">Business Traveler</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </section>

        {/* Local Discovery */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge className="mx-auto bg-accent/10 text-accent border-accent/20">
                <Compass className="w-4 h-4 mr-2" />
                Local Discovery
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-gradient">Discover Hidden Gems</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore local attractions with AI-powered tips and insider knowledge
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {localPlaces.map((place) => (
              <Card key={place.id} className="glass-card overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={place.image} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-background/80">
                    ⭐ {place.rating}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{place.name}</CardTitle>
                  <CardDescription>{place.description}</CardDescription>
                  <Badge variant="secondary" className="w-fit">
                    {place.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => getPlaceTips(place)}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Tips
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
          
          {/* Place Tips Dialog */}
          <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Tips for {selectedPlace?.name}
                </DialogTitle>
                <DialogDescription>
                  Insider tips and local phrases for your visit
                </DialogDescription>
              </DialogHeader>
              
              {tipsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{placeTips}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4">
            <Card className="glass-card max-w-5xl mx-auto">
              <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gradient">Ready to Start Your Journey?</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of travelers who trust Travel Buddy AI to make their adventures unforgettable. 
                    Start planning your next trip with the power of artificial intelligence.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 px-8"
                    onClick={() => setTripPlannerOpen(true)}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Plan Your Trip Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8"
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask AI Assistant
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-8 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free to Use</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI Powered</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gradient">Travel Buddy AI</h3>
                  <p className="text-sm text-muted-foreground">AI Travel Assistant</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your intelligent travel companion powered by advanced AI. Plan, explore, and navigate your journeys with confidence.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  AI Trip Planner
                </li>
                <li className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Generative Explorer
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  AI Assistant Chat
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Helper Tools
                </li>
                <li className="flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Local Discovery
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Emergency SOS
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Help Center</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Travel Tips</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Safety Guidelines</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Community Forum</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Data Protection</a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <p>&copy; 2024 Travel Buddy AI. All rights reserved.</p>
              <Badge variant="outline" className="text-xs">
                Powered by Blink AI
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI Services Online</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Emergency SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={sosOpen} onOpenChange={setSosOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="rounded-full w-16 h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg pulse-glow"
              onClick={getEmergencyAdvice}
            >
              <Shield className="w-8 h-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="border-destructive">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                Emergency SOS
              </DialogTitle>
              <DialogDescription>
                Emergency assistance and safety information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Emergency Numbers:</strong><br />
                  • Local Emergency: 911 (US), 112 (EU)<br />
                  • Your Location: New York, NY (approximate)<br />
                  • Nearest Hospital: Mount Sinai Hospital
                </AlertDescription>
              </Alert>
              
              {sosAdvice && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">AI Safety Advice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{sosAdvice}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1">
                  Call Emergency Services
                </Button>
                <Button variant="outline" className="flex-1">
                  Contact Embassy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App