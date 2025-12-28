"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronLeft, 
  Search,
  Send,
  PlusCircle,
  MessageSquare,
  MoreVertical,
  User,
  Users,
  UserPlus,
  Paperclip,
  Image,
  X,
  FileText
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns'

// Define types for messages
interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: {
    id: number;
    name: string;
    type: string;
    url: string;
  }[];
}

interface Conversation {
  id: number;
  participants: {
    id: number;
    name: string;
    avatar?: string;
    role: 'instructor' | 'student' | 'admin';
    isOnline?: boolean;
  }[];
  messages: Message[];
  isGroup: boolean;
  lastActivity: Date;
  unreadCount: number;
}

// Mock user data
const currentUser = {
  id: 1,
  name: "Emily Johnson",
  avatar: "/images/students/emily.jpg",
  role: "student" as const
};

// Mock conversations data
const conversationsData: Conversation[] = [];

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(conversationsData);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversationsData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    // Check if any participant's name matches the search query
    return conversation.participants.some(participant => 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || 
    // Check if any message content matches the search query
    conversation.messages.some(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Get the other participant's name for a non-group conversation
  const getConversationName = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      return conversation.participants[0].name;
    } else {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      return otherParticipant ? otherParticipant.name : 'Unknown';
    }
  };
  
  // Get the other participant's avatar for a non-group conversation
  const getConversationAvatar = (conversation: Conversation): string | undefined => {
    if (conversation.isGroup) {
      return undefined; // Group chats don't have avatars
    } else {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      return otherParticipant?.avatar;
    }
  };
  
  // Get the online status for a non-group conversation
  const getIsOnline = (conversation: Conversation): boolean => {
    if (conversation.isGroup) {
      return false;
    } else {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
      return otherParticipant?.isOnline || false;
    }
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read when selected
    const updatedConversations = conversations.map(c => {
      if (c.id === conversation.id) {
        const updatedMessages = c.messages.map(message => ({
          ...message,
          isRead: true
        }));
        
        return {
          ...c,
          messages: updatedMessages,
          unreadCount: 0
        };
      }
      return c;
    });
    
    setConversations(updatedConversations);
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMessageObj: Message = {
      id: Math.max(...selectedConversation.messages.map(m => m.id)) + 1,
      senderId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
      isRead: false
    };
    
    const updatedConversations = conversations.map(c => {
      if (c.id === selectedConversation.id) {
        return {
          ...c,
          messages: [...c.messages, newMessageObj],
          lastActivity: new Date()
        };
      }
      return c;
    });
    
    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessageObj],
      lastActivity: new Date()
    });
    setNewMessage("");
  };
  
  // Format message time
  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return format(date, 'h:mm a'); // Today: just show time
    } else if (date >= yesterday) {
      return 'Yesterday'; // Yesterday
    } else {
      return format(date, 'MMM d'); // Older: show date
    }
  };
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold md:text-xl">Messages</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>New Message</span>
              </Button>
              {/*<Avatar>*/}
              {/*  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />*/}
              {/*  <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>*/}
              {/*</Avatar>*/}
            </div>
          </header>
          
          <div className="flex flex-wrap flex-1 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-80 border-r flex flex-col bg-muted/10">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="px-2">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No conversations found</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50 ${
                            selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                          }`}
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <div className="relative">
                            {conversation.isGroup ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                              </div>
                            ) : (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={getConversationAvatar(conversation)} alt={getConversationName(conversation)} />
                                <AvatarFallback>{getConversationName(conversation).substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                            {getIsOnline(conversation) && (
                              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h3 className="truncate font-medium">{getConversationName(conversation)}</h3>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(conversation.lastActivity)}
                              </span>
                            </div>
                            {conversation.messages.length > 0 && (
                              <p className="truncate text-sm text-muted-foreground">
                                {conversation.messages[conversation.messages.length - 1].senderId === currentUser.id
                                  ? 'You: '
                                  : ''}{conversation.messages[conversation.messages.length - 1].content}
                              </p>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs font-semibold">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Conversation Detail */}
            {selectedConversation ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex h-14 items-center justify-between border-b px-4 py-2">
                  <div className="flex items-center gap-2">
                    {selectedConversation.isGroup ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getConversationAvatar(selectedConversation)} 
                          alt={getConversationName(selectedConversation)}
                        />
                        <AvatarFallback>
                          {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h2 className="text-sm font-medium">{getConversationName(selectedConversation)}</h2>
                      {getIsOnline(selectedConversation) && (
                        <p className="text-xs text-green-500">Online</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Add Person</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Mute conversation</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Clear chat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUser.id;
                      const sender = isCurrentUser 
                        ? currentUser 
                        : selectedConversation.participants.find(p => p.id === message.senderId);
                      
                      return (
                        <div key={message.id} className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-8 w-8 mt-0.5">
                            <AvatarImage src={sender?.avatar} alt={sender?.name || 'Unknown'} />
                            <AvatarFallback>{(sender?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{sender?.name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(message.timestamp, 'h:mm a')}
                                </span>
                              </div>
                              <div className={`rounded-lg px-3 py-2 text-sm ${
                                isCurrentUser 
                                  ? 'rounded-tr-none bg-primary text-primary-foreground' 
                                  : 'rounded-tl-none bg-muted'
                              }`}>
                                {message.content}
                              </div>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-1 space-y-1">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 rounded-md border p-2 text-sm"
                                    >
                                      {attachment.type === 'pdf' ? (
                                        <FileText className="h-4 w-4 text-primary" />
                                      ) : (
                                        <Image className="h-4 w-4 text-primary" />
                                      )}
                                      <span className="flex-1 truncate">{attachment.name}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                        <DownloadIcon className="h-3 w-3" />
                                        <span className="sr-only">Download</span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex items-end gap-2">
                    <Textarea 
                      placeholder="Type a message..." 
                      className="min-h-10 flex-1 resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                      </Button>
                      <Button 
                        className="h-9 w-9 rounded-full p-0" 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No conversation selected</h2>
                  <p className="text-muted-foreground mb-4">Choose a conversation from the sidebar or start a new one.</p>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Download Icon component
function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
} 