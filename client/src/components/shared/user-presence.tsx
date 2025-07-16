import { useWebSocketContext } from '@/hooks/websocket-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface UserPresenceProps {
  userId: number;
  firstName: string;
  lastName: string;
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showActivity?: boolean;
}

export function UserPresence({
  userId,
  firstName,
  lastName,
  role,
  size = 'md',
  showStatus = true,
  showActivity = false
}: UserPresenceProps) {
  const { presenceData, lastActivity } = useWebSocketContext();
  
  const userPresence = presenceData[userId];
  const userActivity = lastActivity[userId];
  
  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  
  const getStatusColor = () => {
    if (!userPresence) return 'bg-gray-400';
    
    switch (userPresence.status) {
      case 'online': return 'bg-green-500';
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-amber-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };
  
  const getActivityText = () => {
    if (!userActivity) return 'No recent activity';
    return userActivity;
  };
  
  const getTimeAgo = () => {
    if (!userPresence || !userPresence.timestamp) return '';
    return formatDistanceToNow(new Date(userPresence.timestamp), { addSuffix: true });
  };
  
  const avatarSize = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };
  
  const statusSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            <Avatar className={cn(avatarSize[size])}>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            {showStatus && (
              <span 
                className={cn(
                  "absolute bottom-0 right-0 rounded-full border-2 border-background",
                  statusSize[size],
                  getStatusColor()
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{firstName} {lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
            {showActivity && userActivity && (
              <p className="text-xs mt-1">
                <span className="text-muted-foreground">Last activity: </span>
                {getActivityText()}
              </p>
            )}
            {userPresence && (
              <p className="text-xs mt-1">
                <span className="text-muted-foreground">Status: </span>
                <span className="capitalize">{userPresence.status}</span>
                {userPresence.timestamp && (
                  <span className="text-muted-foreground"> • {getTimeAgo()}</span>
                )}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}