
import { useState, useEffect } from 'react';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export const useConversationManager = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aiCoachConversations');
    if (saved) {
      const parsedConversations = JSON.parse(saved);
      setConversations(parsedConversations);
      
      // Set the most recent conversation as current
      if (parsedConversations.length > 0) {
        setCurrentConversationId(parsedConversations[0].id);
      }
    }
  }, []);

  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('aiCoachConversations', JSON.stringify(convs));
    setConversations(convs);
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: '1',
        text: "Hey! I'm your AI fitness coach. I can help you track your food, workouts, weight, and answer any fitness questions. What would you like to do today?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversationId(newConv.id);
    return newConv.id;
  };

  const updateConversationTitle = (conversationId: string, firstUserMessage: string) => {
    const title = firstUserMessage.length > 30 
      ? firstUserMessage.substring(0, 30) + '...'
      : firstUserMessage;
    
    const updated = conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title, updatedAt: new Date().toISOString() }
        : conv
    );
    saveConversations(updated);
  };

  const addMessageToConversation = (conversationId: string, message: Message) => {
    const updated = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
        return {
          ...conv,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });
    
    // Move current conversation to top
    const currentConv = updated.find(c => c.id === conversationId);
    const others = updated.filter(c => c.id !== conversationId);
    const reordered = currentConv ? [currentConv, ...others] : updated;
    
    saveConversations(reordered);
  };

  const deleteConversation = (conversationId: string) => {
    const updated = conversations.filter(conv => conv.id !== conversationId);
    saveConversations(updated);
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    updateConversationTitle,
    addMessageToConversation,
    deleteConversation,
    getCurrentConversation
  };
};
