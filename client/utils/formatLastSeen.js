// utils/formatLastSeen.js
export const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Today - show time
    if (diffInDays === 0) {
        return `Today at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    if (diffInDays === 1) {
        return `Yesterday at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within a week
    if (diffInDays < 7) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[lastSeen.getDay()]} at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within a month
    if (diffInDays < 30) {
        return `${diffInDays} days ago`;
    }
    
    // More than a month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[lastSeen.getMonth()]} ${lastSeen.getDate()}`;
}