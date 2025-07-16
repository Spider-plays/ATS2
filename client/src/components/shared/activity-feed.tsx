import { useWebSocketContext } from '@/hooks/websocket-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  UserPlus, 
  FileText, 
  User, 
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed() {
  const { notifications } = useWebSocketContext();
  
  if (!notifications.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 p-4">
        {notifications.map((notification, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 transition-colors hover:bg-accent/10"
          >
            <div className="mt-1">
              {notification.type === 'user_created' && (
                <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  <UserPlus size={16} />
                </div>
              )}
              {notification.type === 'job_created' && (
                <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                  <FileText size={16} />
                </div>
              )}
              {notification.type === 'applicant_created' && (
                <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                  <User size={16} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  {notification.type === 'user_created' 
                    ? 'New User Added' 
                    : notification.type === 'job_created'
                      ? 'New Job Posted'
                      : 'New Applicant Added'}
                </h4>
                <Badge variant="outline" className="text-xs font-normal">
                  {notification.timestamp 
                    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                    : 'Just now'}
                </Badge>
              </div>
              
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.type === 'user_created' && notification.user && (
                  <>
                    <span className="font-medium">
                      {notification.user.firstName} {notification.user.lastName}
                    </span>{' '}
                    joined as{' '}
                    <Badge variant="secondary" className="text-xs font-normal">
                      {notification.user.role}
                    </Badge>
                  </>
                )}
                
                {notification.type === 'job_created' && notification.job && (
                  <>
                    New position:{' '}
                    <span className="font-medium">
                      {notification.job.title}
                    </span>{' '}
                    in{' '}
                    <span className="font-medium">
                      {notification.job.department}
                    </span>
                  </>
                )}
                
                {notification.type === 'applicant_created' && notification.applicant && (
                  <>
                    <span className="font-medium">
                      {notification.applicant.name}
                    </span>{' '}
                    applied to{' '}
                    <span className="font-medium">
                      {notification.jobTitle}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}