
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
import { Conversation } from "@/hooks/useConversationManager";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}: ConversationSidebarProps) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-blue-100 border border-blue-200'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageCircle className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
