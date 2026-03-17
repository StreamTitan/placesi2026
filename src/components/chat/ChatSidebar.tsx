import { useState, useEffect } from 'react';
import { X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteConfirmation } from '../../contexts/DeleteConfirmationContext';

interface ChatConversation {
  id: string;
  session_id: string;
  messages: any;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  currentSessionId: string | null;
}

export function ChatSidebar({ isOpen, onClose, onNewChat, onSelectChat, currentSessionId }: ChatSidebarProps) {
  const { user } = useAuth();
  const { showDeleteConfirmation } = useDeleteConfirmation();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = (conversation: ChatConversation, e: React.MouseEvent) => {
    e.stopPropagation();

    const conversationTitle = getConversationTitle(conversation);

    showDeleteConfirmation({
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this conversation? All messages will be permanently removed.',
      itemName: conversationTitle,
      confirmText: 'Delete Conversation',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('chat_conversations')
            .delete()
            .eq('id', conversation.id);

          if (error) throw error;
          setConversations(conversations.filter(c => c.id !== conversation.id));
        } catch (error) {
          console.error('Error deleting conversation:', error);
          alert('Failed to delete conversation. Please try again.');
        }
      },
    });
  };

  const getConversationTitle = (conversation: ChatConversation) => {
    const messages = conversation.messages as any[];
    const firstUserMessage = messages?.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '');
    }
    return 'New Conversation';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No chat history yet. Start a new conversation!
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      onSelectChat(conversation.session_id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${
                      currentSessionId === conversation.session_id
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                          {getConversationTitle(conversation)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conversation, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 left-0 w-full bg-gray-900 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-700 p-6">
            <div className="w-full flex items-center justify-center">
              <img
                src="/placesi-logo-white copy copy.png"
                alt="PlaceSI"
                className="w-48 sm:w-56 md:w-64 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
