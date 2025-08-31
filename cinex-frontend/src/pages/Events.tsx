import React, { useState } from "react";
import { Calendar, MapPin, Clock, Users, Filter, TrendingUp } from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

// Sample event data
const events = [
  {
    id: "event-1",
    title: "Stand-Up Comedy Night",
    description: "Laugh out loud with the best comedians in town",
    image: "/placeholder.svg",
    date: "2024-09-15",
    time: "8:00 PM",
    venue: "Comedy Club Mumbai",
    location: "Bandra West, Mumbai",
    price: "₹299",
    category: "Comedy",
    rating: 4.8,
    attendees: 150
  },
  {
    id: "event-2",
    title: "Rock Music Festival",
    description: "International bands performing live",
    image: "/placeholder.svg",
    date: "2024-09-20",
    time: "6:00 PM",
    venue: "NSCI Stadium",
    location: "Worli, Mumbai",
    price: "₹1299",
    category: "Music",
    rating: 4.9,
    attendees: 5000
  },
  {
    id: "event-3",
    title: "Food & Wine Festival",
    description: "Taste the best cuisines from around the world",
    image: "/placeholder.svg",
    date: "2024-09-25",
    time: "12:00 PM",
    venue: "Phoenix Mills",
    location: "Lower Parel, Mumbai",
    price: "₹799",
    category: "Food",
    rating: 4.7,
    attendees: 800
  },
  {
    id: "event-4",
    title: "Tech Conference 2024",
    description: "Latest trends in technology and innovation",
    image: "/placeholder.svg",
    date: "2024-10-01",
    time: "9:00 AM",
    venue: "Bombay Exhibition Centre",
    location: "Goregaon, Mumbai",
    price: "₹2499",
    category: "Conference",
    rating: 4.6,
    attendees: 1200
  },
  {
    id: "event-5",
    title: "Art Exhibition",
    description: "Contemporary art from local and international artists",
    image: "/placeholder.svg",
    date: "2024-10-05",
    time: "10:00 AM",
    venue: "Jehangir Art Gallery",
    location: "Fort, Mumbai",
    price: "₹199",
    category: "Art",
    rating: 4.5,
    attendees: 300
  }
];

const categories = ["All", "Music", "Comedy", "Food", "Conference", "Art", "Sports", "Theatre"];

const Events = () => {
  const [currentLocation, setCurrentLocation] = useState("Mumbai");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleLocationClick = () => {
    const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
    const currentIndex = locations.indexOf(currentLocation);
    const nextIndex = (currentIndex + 1) % locations.length;
    setCurrentLocation(locations[nextIndex]);
  };

  const filteredEvents = events.filter(event => 
    selectedCategory === "All" || event.category === selectedCategory
  );

  const EventCard = ({ event }: { event: typeof events[0] }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {event.category}
        </Badge>
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-sm font-semibold text-foreground">{event.price}</span>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.venue}, {event.location}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{event.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{event.attendees}+ going</span>
            </div>
          </div>
        </div>
        
        <Button className="w-full" size="sm">
          Book Now
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground">Discover amazing events happening near you</p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Featured Event */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
              <Badge className="mb-4 bg-primary text-primary-foreground">Featured Event</Badge>
              <h2 className="text-xl font-bold mb-2">Rock Music Festival</h2>
              <p className="text-muted-foreground mb-4">Don't miss the biggest music event of the year!</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Sept 20, 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>NSCI Stadium</span>
                </div>
              </div>
              <Button>Get Tickets Now</Button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Trending Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice().reverse().map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Events Near You</h2>
              <Badge variant="outline">{currentLocation}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Events;