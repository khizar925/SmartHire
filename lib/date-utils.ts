import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date string to relative time (e.g., "2 days ago", "Just now")
 * Falls back to formatted date for older dates
 */
export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than 24 hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than 30 days
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Older dates - format as "Jan 15"
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Recently';
  }
}

/**
 * Check if a job was posted within the last 24 hours
 */
export function isNewJob(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  } catch (error) {
    console.error('Error checking if job is new:', error);
    return false;
  }
}

