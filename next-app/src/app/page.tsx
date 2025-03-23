'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  BrainCircuit, 
  LockIcon, 
  UnlockIcon, 
  Sparkle,
  CheckCircle,
  Globe
} from 'lucide-react';

export default function Home() {  
  // Sample stats data
  const stats = [
    { value: "2,500+", label: "Lines of Code" },
    { value: "150+", label: "Commits" },
    { value: "36", label: "Hours of work" },
    { value: "45 min", label: "of Sleep" }
  ];

  // Sample features list
  const features = [
    "Smart course organizer with auto-categorization",
    "AI-powered material summarization",
    "Custom quiz generation with difficulty settings",
    "Deadline tracking and reminders",
    "Study session scheduler with focus timers",
    "Cross-platform synchronization"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Visual Elements - Gradient Orbs */}
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="fixed -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>
      
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-sm">
              <Sparkle className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">CourseDash</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-sm font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full" 
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full" 
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full" 
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button 
                className="rounded-full px-6 py-2 shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/90 active:scale-95 active:shadow-inner relative overflow-hidden group"
              >
                <div className="flex items-center relative z-10">
                  <div className="mr-2 relative">
                    <LockIcon className="h-4 w-4 transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:rotate-12 group-hover:translate-y-2" />
                    <UnlockIcon className="h-4 w-4 absolute top-0 left-0 transition-all duration-300 opacity-0 -rotate-12 -translate-y-2 group-hover:opacity-100 group-hover:rotate-0 group-hover:translate-y-0" />
                  </div>
                  <span>Log In</span>
                </div>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
                  🚀 Boost your academic performance
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up leading-tight">
                  Manage your studies, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">effortlessly</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 animate-slide-up animate-delay-100">
                  Organize your courses, manage materials, and enhance your learning experience with AI-powered summaries and quizzes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/auth">
                    <Button 
                      size="lg" 
                      className="rounded-full px-8 shadow-soft animate-slide-up animate-delay-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/90 active:scale-95 active:shadow-inner relative overflow-hidden group"
                    >
                      <span className="relative z-10">Get Started - It's Free</span> 
                      <ArrowRight className="ml-2 h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </Button>
                  </Link>
                  <Link href="https://github.com/akhkim/CourseDash">
                    <Button 
                      variant="outline"
                      className="rounded-full px-6"
                    >
                      View on GitHub
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <p>Built in <span className="font-medium text-foreground">36 hours</span> for GenAI Genesis</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white p-6 rounded-2xl border shadow-lg transform rotate-2 translate-x-4 translate-y-4 opacity-40 absolute inset-0"></div>
                <div className="bg-white p-6 rounded-2xl border shadow-lg transform -rotate-1 translate-x-2 translate-y-2 opacity-70 absolute inset-0"></div>
                <div className="bg-white p-6 rounded-2xl border shadow-lg relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm font-medium">CourseDash • Materials</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                      <h4 className="font-medium">Data Structures & Algorithms</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" /> Mon, Wed 10:00 AM
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-3 py-1">
                      <h4 className="font-medium">Database Systems</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" /> Tue, Thu 2:00 PM
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-3 py-1">
                      <h4 className="font-medium">Machine Learning</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" /> Fri 1:00 PM
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Upcoming Tasks</div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <div className="h-4 w-4 rounded-full border border-primary/50 mr-2 flex-shrink-0"></div>
                          <span>DS&A Assignment Due - Mar 25</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="h-4 w-4 rounded-full border border-primary/50 mr-2 flex-shrink-0"></div>
                          <span>ML Project Milestone - Mar 29</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2 text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to excel</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                CourseDash combines powerful organization tools with AI assistance to transform your learning experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in animate-delay-300">
              <div className="bg-white p-6 rounded-lg border shadow-soft transition-transform duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full"></div>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Course Management</h3>
                <p className="text-muted-foreground mb-4">Keep track of all your courses, lectures, and materials in one organized place.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Automatic syllabus parsing</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Material categorization</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Progress tracking</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-soft transition-transform duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full"></div>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Schedule Planning</h3>
                <p className="text-muted-foreground mb-4">Set up your weekly schedule with lectures, tutorials, and study sessions.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Smart calendar integration</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Deadline reminders</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Focus time optimization</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-soft transition-transform duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full"></div>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
                <p className="text-muted-foreground mb-4">Generate summaries from uploaded materials and practice with auto-generated quizzes.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Smart note summarization</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Custom quiz generation</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Knowledge gap identification</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link href="/features">
                <Button 
                  variant="outline"
                  className="rounded-full px-6"
                >
                  View All Features <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How CourseDash Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                CourseDash streamlines your academic journey with powerful tools designed for students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg border shadow-soft transition-transform duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Upload & Organize</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Easily upload your lecture materials, syllabi, and notes. CourseDash keeps everything organized by course and topic.
                </p>
                <div className="rounded-lg overflow-hidden border shadow-sm">
                  <div className="bg-muted/20 p-3 border-b">
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      <div className="text-xs text-muted-foreground ml-2">Upload Interface</div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <ArrowRight className="h-6 w-6 text-primary rotate-90" />
                      </div>
                      <p className="text-sm text-center text-muted-foreground">Drag and drop files here</p>
                      <p className="text-xs text-center text-muted-foreground mt-1">PDF, DOCX, PPT, JPG supported</p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        Browse Files
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted/10 rounded">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-xs text-blue-600">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Lecture_3_Notes.pdf</p>
                            <p className="text-xs text-muted-foreground">1.2 MB • 80% processed</p>
                          </div>
                        </div>
                        <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border shadow-soft transition-transform duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Test Your Knowledge</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Practice with automatically generated quizzes based on your course materials at various difficulty levels.
                </p>
                <div className="rounded-lg overflow-hidden border shadow-sm">
                  <div className="bg-muted/20 p-3 border-b">
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      <div className="text-xs text-muted-foreground ml-2">Quiz Interface</div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Data Structures Quiz</h4>
                        <div className="flex items-center text-xs">
                          <span className="text-green-600 font-medium">7/10</span>
                          <span className="text-muted-foreground ml-1">Questions</span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-2/3"></div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium mb-4">Which data structure would be most efficient for implementing a priority queue?</p>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 rounded border border-muted/30 hover:bg-muted/10 cursor-pointer">
                          <div className="h-4 w-4 rounded-full border border-muted-foreground mr-2"></div>
                          <span className="text-sm">Array</span>
                        </div>
                        <div className="flex items-center p-2 rounded border border-green-500 bg-green-50">
                          <div className="h-4 w-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">Heap</span>
                        </div>
                        <div className="flex items-center p-2 rounded border border-muted/30 hover:bg-muted/10 cursor-pointer">
                          <div className="h-4 w-4 rounded-full border border-muted-foreground mr-2"></div>
                          <span className="text-sm">Linked List</span>
                        </div>
                        <div className="flex items-center p-2 rounded border border-muted/30 hover:bg-muted/10 cursor-pointer">
                          <div className="h-4 w-4 rounded-full border border-muted-foreground mr-2"></div>
                          <span className="text-sm">Stack</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">Previous</Button>
                      <Button size="sm">Next Question</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Priceless Features, Priceless App</h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft scale-105">
              <div className="bg-white p-6 rounded-lg border shadow-soft">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">Free</h3>
                  <p className="text-muted-foreground text-sm">The entire applicaiton is accessible for FREE!</p>
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold">$0</div>
                  <p className="text-muted-foreground text-sm">Forever free</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Unlimited Course Support</span>
                  </li>
                  <li className="flex items-center text-sm" />
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Course-Specific Chatbot</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>AI Powered Quiz Generation</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Google Calendar Support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full rounded-full"
                  variant="outline"
                >
                  Get Started Now!
                </Button>
                </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your study habits?</h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Join the desperate students who are studying smarter, not harder with CourseDash.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/40 rounded-full px-8"
                  >
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/20 border-t py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-sm">
                  <Sparkle className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">CourseDash</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                The smart study companion for students who want to excel in their academic journey.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Guide</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
